import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Segment } from '../../database/entities/segment.entity';
import { VoiceCampaign } from '../../database/entities/voice-campaign.entity';
import { VoiceCampaignRecipient, VoiceCampaignRecipientStatus } from '../../database/entities/voice-campaign-recipient.entity';
import { VoiceSuppression } from '../../database/entities/voice-provider-config.entity';

export function normalizeVoicePhone(value: string): string { return String(value ?? '').replace(/[\s().-]/g, ''); }
export function validVoicePhone(value: string): boolean { return /^\+[1-9]\d{7,14}$/.test(value); }

@Injectable()
export class VoiceAudienceService {
  constructor(private readonly db: DataSource) {}
  async page(tenantId: string, source: Record<string, any>, after?: string, limit = 250) {
    const type = source.type === 'leads' ? Lead : Contact;
    const query = this.db.getRepository(type).createQueryBuilder('recipient').where('recipient.tenantId = :tenantId', { tenantId });
    if (after) query.andWhere('recipient.id > :after', { after });
    if (source.ids?.length) query.andWhere('recipient.id IN (:...ids)', { ids: source.ids });
    if (source.status) query.andWhere('recipient.status = :status', { status: source.status });
    if (source.search) query.andWhere('(recipient.firstName ILIKE :search OR recipient.phone ILIKE :search OR recipient.email ILIKE :search)', { search: `%${String(source.search).slice(0,100)}%` });
    if (source.leadSource && type === Contact) query.andWhere('recipient.leadSource = :source', { source: source.leadSource });
    if (source.segmentId) {
      const segment = await this.db.getRepository(Segment).findOneBy({ id: source.segmentId, tenantId });
      if (!segment) throw new BadRequestException('Segment not found');
      for (const [i, rule] of (segment.rules?.conditions ?? []).entries()) {
        const value = rule.value;
        if (rule.field === 'status') query.andWhere(`recipient.status = :rule${i}`, { [`rule${i}`]: value });
        else if (['tag', 'tags'].includes(rule.field)) query.andWhere(`:rule${i} = ANY(recipient.tags)`, { [`rule${i}`]: value });
        else if (rule.field === 'ids') query.andWhere(`recipient.id IN (:...rule${i})`, { [`rule${i}`]: String(value).split(',').map((id) => id.trim()) });
        else throw new BadRequestException(`Unsupported segment condition: ${rule.field}; use a supported filter rather than expanding the audience`);
      }
    }
    return query.orderBy('recipient.id', 'ASC').take(Math.min(500, limit)).getMany();
  }
  async prepareBatch(campaign: VoiceCampaign) {
    const config = campaign.configuration;
    const source = config.audience ?? { type: 'contacts', segmentId: campaign.contactListId };
    const rows = await this.page(campaign.tenantId, source, config.audienceCursor);
    const recipients = this.db.getRepository(VoiceCampaignRecipient);
    for (const person of rows) {
      const phone = normalizeVoicePhone((person as Contact).mobile || person.phone || '');
      const suppressed = (person as Contact).doNotContact || (person as Lead).metadata?.doNotCall || await this.db.getRepository(VoiceSuppression).existsBy({ tenantId: campaign.tenantId, phone });
      const reason = !validVoicePhone(phone) ? 'Invalid E.164 phone number' : suppressed ? 'Do not call / opted out' : undefined;
      if (!phone) continue;
      await recipients.createQueryBuilder().insert().values({ tenantId: campaign.tenantId, campaignId: campaign.id, ...(source.type === 'leads' ? { leadId: person.id } : { contactId: person.id }), phone, status: reason ? VoiceCampaignRecipientStatus.SKIPPED : VoiceCampaignRecipientStatus.PENDING, failureReason: reason, maxAttempts: campaign.maxAttempts }).orIgnore().execute();
    }
    campaign.configuration = { ...config, audienceCursor: rows.at(-1)?.id ?? config.audienceCursor, audiencePrepared: rows.length < 250 };
    campaign.totalContacts = await recipients.countBy({ tenantId: campaign.tenantId, campaignId: campaign.id });
    await this.db.getRepository(VoiceCampaign).save(campaign);
    return campaign.configuration.audiencePrepared;
  }

  /** RFC4180-style quoted fields, bounded per upload; batches can be appended to the CRM. */
  parseCsv(csv: string): string[][] {
    if (Buffer.byteLength(csv) > 3_000_000) throw new BadRequestException('CSV batch must be smaller than 3 MB');
    const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      if (char === '"') { if (quoted && csv[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
      else if (char === ',' && !quoted) { row.push(field); field = ''; }
      else if (char === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
      else field += char;
    }
    if (quoted) throw new BadRequestException('CSV has an unterminated quoted field');
    if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    if (rows.length > 5001) throw new BadRequestException('Import at most 5,000 rows per batch');
    return rows.filter((r) => r.some((v) => v.trim()));
  }
  async importCsv(tenantId: string, csv: string, mapping: Record<string, string>, commit = false) {
    const [header, ...rows] = this.parseCsv(csv);
    if (!header) throw new BadRequestException('CSV is empty');
    const seen = new Set<string>(); const results: Array<Record<string, any>> = []; const ids: string[] = [];
    for (const [index, row] of rows.entries()) {
      const data: Record<string, string> = {};
      for (const field of ['firstName', 'lastName', 'phone', 'email', 'company']) data[field] = row[header.indexOf(mapping[field] || field)]?.trim() || '';
      const phone = normalizeVoicePhone(data.phone);
      let status = 'READY'; let reason = '';
      if (!validVoicePhone(phone)) { status = 'INVALID'; reason = 'Phone must include + and country code'; }
      else if (seen.has(phone)) { status = 'DUPLICATE'; reason = 'Duplicate phone in CSV'; }
      else if (await this.db.getRepository(VoiceSuppression).existsBy({ tenantId, phone })) { status = 'SUPPRESSED'; reason = 'Phone is on do-not-call list'; }
      seen.add(phone);
      // Existing contacts are never overwritten by imported data. New phone-only rows use CRM leads.
      const contact = validVoicePhone(phone) ? await this.db.getRepository(Contact).findOne({ where: [{ tenantId, phone }, { tenantId, mobile: phone }] }) : null;
      const lead = validVoicePhone(phone) ? await this.db.getRepository(Lead).findOneBy({ tenantId, phone }) : null;
      if (contact?.doNotContact || lead?.metadata?.doNotCall) { status = 'SUPPRESSED'; reason = 'Existing CRM record opted out'; }
      if (status === 'READY' && (contact || lead)) { status = 'EXISTING'; reason = 'Already exists in CRM; select it through CRM audience'; }
      if (status === 'READY' && commit) {
        const customFields = Object.fromEntries(header.map((name, i) => [name, row[i] ?? '']));
        const created = await this.db.getRepository(Lead).save(this.db.getRepository(Lead).create({ tenantId, firstName: data.firstName, lastName: data.lastName || undefined, phone, email: data.email || undefined, metadata: { company: data.company, customFields, source: 'VOICE_CSV' } }));
        ids.push(created.id);
      }
      results.push({ row: index + 2, phone, status, reason, ...data });
    }
    return { total: rows.length, ready: results.filter((r) => r.status === 'READY').length, invalid: results.filter((r) => r.status === 'INVALID').length, duplicates: results.filter((r) => ['DUPLICATE', 'EXISTING'].includes(r.status)).length, suppressed: results.filter((r) => r.status === 'SUPPRESSED').length, rows: results, importedLeadIds: ids };
  }

  async assertOwnedIds(tenantId: string, source: Record<string, any>) {
    if (source.ids?.length) {
      if (!Array.isArray(source.ids) || source.ids.length > 5000) throw new BadRequestException('Select at most 5,000 IDs; use filters for larger audiences');
      const count = await this.db.getRepository(source.type === 'leads' ? Lead : Contact).countBy({ tenantId, id: In(source.ids) });
      if (count !== new Set(source.ids).size) throw new BadRequestException('Audience contains missing or unauthorized recipients');
    }
  }
}
