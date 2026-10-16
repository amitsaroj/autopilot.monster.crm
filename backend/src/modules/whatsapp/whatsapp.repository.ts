import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseRepository } from '../../database/base.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';

export interface WhatsappConversationRow {
  phone: string;
  phoneNumberId: string | null;
  contactName: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  direction: 'INBOUND' | 'OUTBOUND';
  messageCount: string;
  unreadCount: string;
  assigneeId: string | null;
  teamId: string | null;
  status: string | null;
  priority: string | null;
  tags: string[] | null;
  latestInboundAt: Date | null;
  awaitingReplyCount: string;
  csatStatus: string | null;
  csatRating: string | null;
}

@Injectable()
export class WhatsappMessageRepository extends BaseRepository<WhatsAppMessage> {
  constructor(
    @InjectRepository(WhatsAppMessage)
    whatsappRepo: Repository<WhatsAppMessage>,
  ) {
    super(whatsappRepo);
  }

  async findConversation(
    tenantId: string,
    phone: string,
    phoneNumberId?: string,
    page = 1,
    limit = 50,
  ): Promise<WhatsAppMessage[]> {
    return this.repository.find({
      where: [
        { tenantId, from: phone, ...(phoneNumberId ? { phoneNumberId } : {}) },
        { tenantId, to: phone, ...(phoneNumberId ? { phoneNumberId } : {}) },
      ],
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findConversationSummaries(
    tenantId: string,
    page: number,
    limit: number,
    phone?: string,
    phoneNumberId?: string,
  ): Promise<[WhatsappConversationRow[], number]> {
    const params = [tenantId, phone ?? null, limit, (page - 1) * limit, phoneNumberId ?? null];
    const rows = await this.repository.query<WhatsappConversationRow[]>(
      `WITH threads AS (
         SELECT CASE WHEN m.direction = 'INBOUND' THEN m."from" ELSE m."to" END AS phone,
                m.phone_number_id AS "phoneNumberId",
                MAX(m.created_at) AS "lastMessageAt",
                COUNT(*) AS "messageCount",
                COUNT(*) FILTER (
                  WHERE m.direction = 'INBOUND'
                    AND NOT EXISTS (
                      SELECT 1
                      FROM whatsapp_messages sent
                      WHERE sent.tenant_id = m.tenant_id
                        AND sent.phone_number_id IS NOT DISTINCT FROM m.phone_number_id
                        AND (CASE WHEN sent.direction = 'INBOUND' THEN sent."from" ELSE sent."to" END)
                            = (CASE WHEN m.direction = 'INBOUND' THEN m."from" ELSE m."to" END)
                        AND sent.direction = 'OUTBOUND'
                        AND (sent.created_at > m.created_at OR
                          (sent.created_at = m.created_at AND sent.id > m.id))
                    )
                ) AS "awaitingReplyCount"
         FROM whatsapp_messages m
         WHERE m.tenant_id = $1
           AND ($2::text IS NULL OR (CASE WHEN m.direction = 'INBOUND' THEN m."from" ELSE m."to" END) = $2)
           AND ($5::text IS NULL OR m.phone_number_id = $5)
         GROUP BY m.tenant_id, m.phone_number_id,
                  CASE WHEN m.direction = 'INBOUND' THEN m."from" ELSE m."to" END
       ), paged AS (
         SELECT * FROM threads ORDER BY "lastMessageAt" DESC, phone, "phoneNumberId" NULLS FIRST
         LIMIT $3 OFFSET $4
       )
       SELECT p.phone,
              p."phoneNumberId",
              NULLIF(CONCAT_WS(' ', c.first_name, c.last_name), '') AS "contactName",
              latest.body AS "lastMessage",
              p."lastMessageAt",
              latest.direction,
              p."messageCount",
              unread.count AS "unreadCount",
              c.owner_id AS "assigneeId",
              c.custom_fields ->> 'whatsappTeamId' AS "teamId",
              c.custom_fields ->> 'whatsappStatus' AS status,
              c.custom_fields ->> 'whatsappPriority' AS priority,
              c.tags,
              inbound.provider_timestamp AS "latestInboundAt",
              CASE WHEN c.custom_fields ->> 'whatsappStatus' = 'RESOLVED'
                   THEN 0 ELSE p."awaitingReplyCount" END AS "awaitingReplyCount",
              c.custom_fields -> 'whatsappCsat' ->> 'status' AS "csatStatus",
              c.custom_fields -> 'whatsappCsat' ->> 'rating' AS "csatRating"
       FROM paged p
       LEFT JOIN LATERAL (
         SELECT contact.* FROM contacts contact
         WHERE contact.tenant_id = $1
           AND (regexp_replace(COALESCE(contact.phone, ''), '\\D', '', 'g') = regexp_replace(p.phone, '\\D', '', 'g')
             OR regexp_replace(COALESCE(contact.mobile, ''), '\\D', '', 'g') = regexp_replace(p.phone, '\\D', '', 'g'))
         ORDER BY contact.updated_at DESC, contact.id
         LIMIT 1
       ) c ON TRUE
       JOIN LATERAL (
         SELECT msg.body, msg.direction FROM whatsapp_messages msg
         WHERE msg.tenant_id = $1 AND msg.phone_number_id IS NOT DISTINCT FROM p."phoneNumberId"
           AND (CASE WHEN msg.direction = 'INBOUND' THEN msg."from" ELSE msg."to" END) = p.phone
         ORDER BY msg.created_at DESC, msg.id DESC LIMIT 1
       ) latest ON TRUE
       LEFT JOIN LATERAL (
         SELECT msg.provider_timestamp FROM whatsapp_messages msg
         WHERE msg.tenant_id = $1 AND msg.phone_number_id IS NOT DISTINCT FROM p."phoneNumberId"
           AND msg.direction = 'INBOUND' AND msg."from" = p.phone
         ORDER BY msg.created_at DESC, msg.id DESC LIMIT 1
       ) inbound ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS count FROM whatsapp_messages msg
         WHERE msg.tenant_id = $1 AND msg.phone_number_id IS NOT DISTINCT FROM p."phoneNumberId"
           AND msg.direction = 'INBOUND' AND msg."from" = p.phone
           AND (c.custom_fields ->> 'whatsappReadAt' IS NULL OR
             CASE WHEN c.custom_fields ->> 'whatsappReadAt' ~ '^\\d{4}-\\d{2}-\\d{2}T'
               THEN msg.created_at > (c.custom_fields ->> 'whatsappReadAt')::timestamptz
               ELSE TRUE END)
       ) unread ON TRUE
       ORDER BY p."lastMessageAt" DESC, p.phone, p."phoneNumberId" NULLS FIRST`,
      params,
    );
    const [{ count }] = await this.repository.query<Array<{ count: string }>>(
      `SELECT COUNT(*) AS count FROM (
         SELECT 1 FROM whatsapp_messages m
         WHERE m.tenant_id = $1
           AND ($2::text IS NULL OR (CASE WHEN m.direction = 'INBOUND' THEN m."from" ELSE m."to" END) = $2)
           AND ($3::text IS NULL OR m.phone_number_id = $3)
         GROUP BY m.phone_number_id,
                  CASE WHEN m.direction = 'INBOUND' THEN m."from" ELSE m."to" END
       ) conversation_count`,
      [tenantId, phone ?? null, phoneNumberId ?? null],
    );
    return [rows, Number(count)];
  }

  async getInboxSla(
    tenantId: string,
    thresholdMs: number,
    from?: string,
    to?: string,
  ): Promise<{ average: string | null; breached: string }> {
    const [row] = await this.repository.query<Array<{ average: string | null; breached: string }>>(
      `WITH ordered AS (
         SELECT phone_number_id,
                CASE WHEN direction = 'INBOUND' THEN "from" ELSE "to" END AS phone,
                direction, created_at, id,
                COUNT(*) FILTER (WHERE direction = 'OUTBOUND') OVER (
                  PARTITION BY phone_number_id, CASE WHEN direction = 'INBOUND' THEN "from" ELSE "to" END
                  ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS cycle
         FROM whatsapp_messages WHERE tenant_id = $1
       ), replies AS (
         SELECT phone_number_id, phone, cycle,
                MAX(created_at) FILTER (WHERE direction = 'INBOUND') AS inbound_at,
                MIN(created_at) FILTER (WHERE direction = 'OUTBOUND') AS outbound_at
         FROM ordered GROUP BY phone_number_id, phone, cycle
       )
       SELECT AVG(EXTRACT(EPOCH FROM (outbound_at - inbound_at)) * 1000)::text AS average,
              COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (outbound_at - inbound_at)) * 1000 > $2)::text AS breached
       FROM replies WHERE inbound_at IS NOT NULL AND outbound_at IS NOT NULL AND outbound_at >= inbound_at
         AND ($3::timestamptz IS NULL OR outbound_at >= $3)
         AND ($4::timestamptz IS NULL OR outbound_at < $4)`,
      [tenantId, thresholdMs, from ?? null, to ?? null],
    );
    return row;
  }

  async updateStatusByMessageSid(
    tenantId: string,
    messageSid: string,
    status: string,
  ): Promise<void> {
    await this.repository.update({ tenantId, messageSid }, { status });
  }
}
