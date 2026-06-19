import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { LeadService } from './lead.service';
import { NotificationService } from './notification.service';

@Injectable()
export class LeadIntelligenceService {
  private readonly logger = new Logger(LeadIntelligenceService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private leadService: LeadService,
    private notificationService: NotificationService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'mock-api-key',
    });
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

      return result;
    } catch (err) {
      this.logger.error(`AI analysis failed for lead ${leadId}`, err);
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
  } | null> {
    if (!transcript.trim()) {
      return null;
    }

    if (this.configService.get('OPENAI_API_KEY') === 'mock-api-key') {
      return {
        summary: 'Call completed. AI analysis unavailable in mock mode.',
        score: 0,
        status: 'PROCESSED',
        intent: 'UNKNOWN',
        sentiment: 'NEUTRAL',
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
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
            
            Return ONLY a JSON object: { "name": "...", "email": "...", "summary": "...", "score": 85, "status": "QUALIFIED", "intent": "DEMO", "sentiment": "POSITIVE" }`,
          },
          { role: 'user', content: transcript },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const sentiment = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(result.sentiment)
        ? result.sentiment
        : 'NEUTRAL';

      return {
        name: result.name,
        email: result.email,
        summary: result.summary || '',
        score: result.score || 0,
        status: result.status || 'PROCESSED',
        intent: result.intent || 'UNKNOWN',
        sentiment,
      };
    } catch (err) {
      this.logger.error('AI transcript analysis failed', err);
      return null;
    }
  }
}
