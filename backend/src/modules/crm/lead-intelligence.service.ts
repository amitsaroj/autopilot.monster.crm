import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import { NotificationService } from './notification.service';
import { AiProviderService } from '../ai/providers/ai-provider.service';
import { EVENT_NAMES } from '../../events/event.constants';

/** Standardized contact-level outcome vocabulary — mirrors VoiceCallDisposition in the voice module (kept
 * independent rather than imported to avoid a crm->voice module dependency; the string values must match). */
const VALID_DISPOSITIONS = new Set([
  'INTERESTED',
  'NOT_INTERESTED',
  'CALLBACK_REQUESTED',
  'QUALIFIED',
  'NOT_QUALIFIED',
  'WRONG_NUMBER',
  'DO_NOT_CALL',
  'CONVERTED',
]);

@Injectable()
export class LeadIntelligenceService {
  private readonly logger = new Logger(LeadIntelligenceService.name);

  constructor(
    private configService: ConfigService,
    private leadService: LeadService,
    private contactService: ContactService,
    private notificationService: NotificationService,
    private aiProviderService: AiProviderService,
    private eventEmitter: EventEmitter2,
  ) {}

  private isOpenAiAvailable(): boolean {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    return !!apiKey && apiKey !== 'mock-api-key';
  }

  /**
   * Analyzes a call transcript to score the lead and summarize the outcome.
   */
  async analyzeCallOutcome(tenantId: string, leadId: string, transcript: string) {
    const result = await this.analyzeTranscript(transcript);
    if (!result) {
      return null;
    }

    try {
      await this.leadService.update(tenantId, leadId, {
        score: result.score || 0,
        aiSummary: result.summary || '',
        status: result.status || 'PROCESSED',
        email: result.email || undefined,
        metadata: {
          extractedName: result.name,
          intent: result.intent,
          sentiment: result.sentiment,
          disposition: result.disposition,
          analyzedAt: new Date().toISOString(),
        },
      });

      if (result.status === 'QUALIFIED') {
        const lead = await this.leadService.findOne(tenantId, leadId);
        if (lead && lead.phone) {
          await this.notificationService.sendPostCallFollowUp(
            tenantId,
            lead.phone,
            result.name || lead.firstName || 'there',
            result.summary,
          );
        }
      }

      this.emitDisposition({
        tenantId,
        leadId,
        disposition: result.disposition,
        summary: result.summary,
      });

      return result;
    } catch (err) {
      this.logger.error(`AI analysis failed for lead ${leadId}`, err);
      return null;
    }
  }

  /**
   * Same as analyzeCallOutcome, but for calls dialed off a Contact (bulk voice
   * campaigns) rather than a Lead. Contacts have no aiSummary/score columns, so
   * the outcome is logged as a CALL activity on the contact's timeline instead,
   * and the WhatsApp follow-up only fires if the contact has opted in.
   */
  async analyzeContactCallOutcome(
    tenantId: string,
    contactId: string,
    transcript: string,
    campaignContext: { campaignId?: string; recipientId?: string } = {},
  ) {
    const result = await this.analyzeTranscript(transcript);
    if (!result) {
      return null;
    }

    try {
      const contact = await this.contactService.findOne(tenantId, contactId);
      await this.contactService.recordCallActivity(tenantId, contactId, {
        summary: result.summary,
        sentiment: result.disposition || result.sentiment,
        status: result.status,
      });

      // A caller explicitly asking to stop being called is a real compliance
      // requirement, not just a disposition label — suppress all future
      // automated outbound to this contact immediately.
      if (result.doNotCall && !contact.doNotContact) {
        await this.contactService.setDoNotContact(tenantId, contactId, true);
        this.logger.log(`Contact ${contactId} opted out during call — marked do-not-contact`);
      }

      if (result.status === 'QUALIFIED' && contact.whatsappOptIn) {
        const phone = contact.mobile ?? contact.phone;
        if (phone) {
          await this.notificationService.sendPostCallFollowUp(
            tenantId,
            phone,
            result.name || contact.firstName,
            result.summary,
          );
        }
      }

      this.emitDisposition({
        tenantId,
        contactId,
        disposition: result.disposition,
        summary: result.summary,
        campaignId: campaignContext.campaignId,
        recipientId: campaignContext.recipientId,
      });

      return result;
    } catch (err) {
      this.logger.error(`AI analysis failed for contact ${contactId}`, err);
      return null;
    }
  }

  async analyzeTranscript(transcript: string): Promise<{
    name?: string;
    email?: string;
    summary: string;
    score: number;
    status: string;
    intent: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    disposition: string;
    doNotCall: boolean;
  } | null> {
    if (!transcript.trim()) {
      return null;
    }

    if (!this.isOpenAiAvailable()) {
      this.logger.warn('OpenAI API key not configured — skipping transcript analysis');
      return null;
    }

    try {
      const response = await this.aiProviderService.chatComplete(
        undefined,
        [
          {
            role: 'system',
            content: `You are an expert sales analyst. Analyze the following call transcript.
            Extract:
            1. Full Name of the lead if mentioned.
            2. Email address if mentioned.
            3. A concise summary of the call.
            4. A lead score from 0-100.
            5. A suggested status (e.g., QUALIFIED, FOLLOW_UP, UNQUALIFIED).
            6. Primary Intent (e.g., PRICING, SUPPORT, DEMO).
            7. Sentiment as POSITIVE, NEUTRAL, or NEGATIVE.
            8. A standardized disposition — exactly one of: INTERESTED, NOT_INTERESTED,
               CALLBACK_REQUESTED, QUALIFIED, NOT_QUALIFIED, WRONG_NUMBER, DO_NOT_CALL, CONVERTED.
            9. doNotCall: true ONLY if the person explicitly asked to not be called again, to be
               removed from the list, to stop calling, or said they are not the right person and
               asked not to be contacted — otherwise false. Be conservative; this suppresses all
               future automated calls to this person.

            Return ONLY a JSON object: { "name": "...", "email": "...", "summary": "...", "score": 85, "status": "QUALIFIED", "intent": "DEMO", "sentiment": "POSITIVE", "disposition": "QUALIFIED", "doNotCall": false }`,
          },
          { role: 'user', content: transcript },
        ],
        { model: 'gpt-4o-mini', jsonMode: true },
      );

      const result = JSON.parse(response.content || '{}');
      const sentiment = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(result.sentiment)
        ? result.sentiment
        : 'NEUTRAL';
      const doNotCall = result.doNotCall === true;
      const disposition = VALID_DISPOSITIONS.has(result.disposition)
        ? result.disposition
        : doNotCall
          ? 'DO_NOT_CALL'
          : sentiment === 'POSITIVE'
            ? 'INTERESTED'
            : 'NOT_INTERESTED';

      return {
        name: result.name,
        email: result.email,
        summary: result.summary || '',
        score: result.score || 0,
        status: result.status || 'PROCESSED',
        intent: result.intent || 'UNKNOWN',
        sentiment,
        disposition,
        doNotCall,
      };
    } catch (err) {
      this.logger.error('AI transcript analysis failed', err);
      return null;
    }
  }

  /** Notifies the workflow-automation and campaign-recipient listeners of a standardized call outcome. */
  private emitDisposition(payload: {
    tenantId: string;
    disposition: string;
    summary: string;
    leadId?: string;
    contactId?: string;
    campaignId?: string;
    recipientId?: string;
  }): void {
    this.eventEmitter.emit(EVENT_NAMES.CALL_DISPOSITIONED, payload);
  }
}
