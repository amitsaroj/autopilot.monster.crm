import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { isAxiosError } from 'axios';
import { isIP } from 'net';

import type { WhatsappProviderName } from '../../database/entities/whatsapp-account.entity';

export interface WhatsappCredentials {
  provider: WhatsappProviderName;
  phoneNumberId: string;
  businessAccountId: string;
  /** Internal only. Never return this object from an HTTP endpoint or log it. */
  accessToken: string;
}

export interface WhatsappCapabilities {
  text: boolean;
  template: boolean;
  media: boolean;
  interactive: boolean;
  flows: boolean;
  calling: boolean;
  groups: boolean;
}

export const WHATSAPP_PROVIDER_CAPABILITIES: Readonly<
  Record<WhatsappProviderName, Readonly<WhatsappCapabilities>>
> = Object.freeze({
  meta: Object.freeze({
    text: true,
    template: true,
    media: true,
    interactive: true,
    flows: false,
    calling: false,
    groups: false,
  }),
});

export interface WhatsappPhoneHealth {
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  codeVerificationStatus: 'VERIFIED' | 'NOT_VERIFIED' | 'EXPIRED' | 'UNKNOWN';
}

/** References to already-uploaded provider media or public HTTPS assets; no upload/fetch. */
export type WhatsappMediaReference = { id: string; link?: never } | { link: string; id?: never };
export type WhatsappMediaType = 'image' | 'video' | 'audio' | 'document';
export type WhatsappMediaPayload = WhatsappMediaReference & { caption?: string; filename?: string };
export interface WhatsappTemplateTextParameter {
  type: 'text';
  text: string;
  parameter_name?: string;
}
export type WhatsappTemplateHeaderParameter =
  | WhatsappTemplateTextParameter
  | { type: 'image'; image: WhatsappMediaReference }
  | { type: 'video'; video: WhatsappMediaReference }
  | { type: 'document'; document: WhatsappMediaReference & { filename?: string } };
export type WhatsappTemplateComponent =
  | { type: 'header'; parameters: readonly [WhatsappTemplateHeaderParameter] }
  | { type: 'body'; parameters: readonly WhatsappTemplateTextParameter[] }
  | {
      type: 'button';
      sub_type: 'url';
      index: number | string;
      parameters: readonly [WhatsappTemplateTextParameter];
    }
  | {
      type: 'button';
      sub_type: 'quick_reply';
      index: number | string;
      parameters: readonly [{ type: 'payload'; payload: string }];
    }
  | {
      type: 'button';
      sub_type: 'copy_code';
      index: number | string;
      parameters: readonly [{ type: 'coupon_code'; coupon_code: string }];
    };
export type WhatsappInteractiveHeader =
  | { type: 'text'; text: string }
  | { type: 'image'; image: WhatsappMediaReference }
  | { type: 'video'; video: WhatsappMediaReference }
  | { type: 'document'; document: WhatsappMediaReference & { filename?: string } };
export type WhatsappInteractivePayload = {
  body: { text: string };
  footer?: { text: string };
} & (
  | {
      type: 'button';
      header?: WhatsappInteractiveHeader;
      action: { buttons: readonly { type: 'reply'; reply: { id: string; title: string } }[] };
    }
  | {
      type: 'list';
      header?: { type: 'text'; text: string };
      action: {
        button: string;
        sections: readonly {
          title?: string;
          rows: readonly { id: string; title: string; description?: string }[];
        }[];
      };
    }
);

export type WhatsappSendRequest =
  | { type: 'text'; to: string; text: string }
  | {
      type: 'template';
      to: string;
      templateName: string;
      language: string;
      /** Legacy shorthand. Mutually exclusive with components. */
      bodyParameters?: readonly string[];
      components?: readonly WhatsappTemplateComponent[];
    }
  | { type: WhatsappMediaType; to: string; media: WhatsappMediaPayload }
  | { type: 'interactive'; to: string; interactive: WhatsappInteractivePayload };

export interface WhatsappSendResult {
  provider: WhatsappProviderName;
  providerMessageId: string;
}

export type WhatsappProviderFailureKind = 'NOT_SUBMITTED' | 'REJECTED' | 'AMBIGUOUS';

/** Sanitized send failure. Never carries Axios config, response bodies, or a cause.
 * retryable is true only where another provider attempt is safe from duplication.
 * AMBIGUOUS requires reconciliation, even when Meta reports a transient error.
 */
export class WhatsappProviderError extends HttpException {
  readonly ambiguous: boolean;
  readonly definiteRejection: boolean;

  constructor(
    readonly kind: WhatsappProviderFailureKind,
    readonly retryable: boolean,
    readonly httpStatus?: number,
    readonly providerCode?: number,
  ) {
    const message =
      kind === 'AMBIGUOUS'
        ? 'Meta message acceptance is unknown; reconcile before retrying'
        : kind === 'REJECTED'
          ? 'Meta rejected the WhatsApp message'
          : 'WhatsApp message was not submitted; check configuration and message parameters';
    super(
      {
        message,
        kind,
        retryable,
        ambiguous: kind === 'AMBIGUOUS',
        definiteRejection: kind === 'REJECTED',
        httpStatus,
        providerCode,
      },
      kind === 'AMBIGUOUS' ? 502 : kind === 'REJECTED' && httpStatus ? httpStatus : 400,
    );
    this.ambiguous = kind === 'AMBIGUOUS';
    this.definiteRejection = kind === 'REJECTED';
  }
}

export interface WhatsappProvider {
  readonly name: WhatsappProviderName;
  readonly capabilities: Readonly<WhatsappCapabilities>;
  validateCredentials(credentials: WhatsappCredentials): Promise<WhatsappPhoneHealth>;
  readHealth(credentials: WhatsappCredentials): Promise<WhatsappPhoneHealth>;
  send(credentials: WhatsappCredentials, message: WhatsappSendRequest): Promise<WhatsappSendResult>;
  /** Validated Meta-shaped content. Caller owns tenant consent/window/usage policy. */
  sendContent(
    credentials: WhatsappCredentials,
    to: string,
    content: Readonly<Record<string, unknown>>,
  ): Promise<WhatsappSendResult>;
}

interface MetaPhone {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
  code_verification_status?: string;
}

interface MetaPhonePage {
  data?: Array<{ id?: string }>;
  paging?: { next?: string; cursors?: { after?: string } };
}

/** Source review: 2026-10-13. Official Graph API versions (not Marketing API).
 * https://developers.facebook.com/docs/graph-api/changelog/versions/
 * Retrieved through https://r.jina.ai/https://developers.facebook.com/docs/graph-api/changelog/versions/
 * after direct reads returned 429. Release/expiry as published by Meta:
 * v23: 2025-05-29 / 2027-10-08; v24: 2025-10-08 / 2028-02-18;
 * v25: 2026-02-18 / 2028-07-29; v26: 2026-07-29 / TBD (no inferred expiry).
 * These are reviewed versions, not feature introduction dates. v23 remains default.
 * Content schemas reviewed from Meta's own facebook/openapi v23 specification:
 * https://github.com/facebook/openapi/blob/main/business-messaging-api_v23.0.yaml
 * Coupon/named parameters additionally verified against the official send example:
 * https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/coupon-templates
 * Adapter supports text; image/video/audio/document references; basic header/body
 * text + media header + URL/quick_reply/copy_code template buttons; interactive
 * reply buttons/lists. No uploads, asset fetching, flows, catalogs, groups or calls.
 * Capabilities describe implemented adapter content, not tenant policy/send readiness.
 */
const API_VERSIONS: Readonly<Record<string, string | null>> = Object.freeze({
  'v23.0': '2027-10-08T00:00:00Z',
  'v24.0': '2028-02-18T00:00:00Z',
  'v25.0': '2028-07-29T00:00:00Z',
  'v26.0': null, // Meta has not yet published an expiration date.
});

export function validateWhatsappApiVersion(version: string): string {
  if (
    !/^v[0-9]+\.0$/.test(version) ||
    !Object.prototype.hasOwnProperty.call(API_VERSIONS, version)
  ) {
    throw new ServiceUnavailableException(
      'WHATSAPP_API_VERSION must be a reviewed Graph API version (v23.0–v26.0)',
    );
  }
  const expires = API_VERSIONS[version];
  if (expires && Date.now() >= Date.parse(expires)) {
    throw new ServiceUnavailableException(
      'WHATSAPP_API_VERSION has expired; configure a supported version',
    );
  }
  return version;
}

export function assertWhatsappCredentials(credentials: WhatsappCredentials): void {
  if (
    credentials.provider !== 'meta' ||
    !/^[1-9][0-9]{0,63}$/.test(credentials.phoneNumberId) ||
    !/^[1-9][0-9]{0,63}$/.test(credentials.businessAccountId) ||
    typeof credentials.accessToken !== 'string' ||
    !/^\S{1,8192}$/.test(credentials.accessToken)
  ) {
    throw new BadRequestException('Invalid WhatsApp account credentials');
  }
}

@Injectable()
export class MetaWhatsappProvider implements WhatsappProvider {
  readonly name = 'meta' as const;
  readonly capabilities = WHATSAPP_PROVIDER_CAPABILITIES.meta;
  readonly apiVersion: string;

  constructor(config: ConfigService) {
    this.apiVersion = validateWhatsappApiVersion(
      config.get<string>('WHATSAPP_API_VERSION') ?? 'v23.0',
    );
  }

  async validateCredentials(credentials: WhatsappCredentials): Promise<WhatsappPhoneHealth> {
    assertWhatsappCredentials(credentials);
    // WABA access alone is insufficient: the phone must belong to this WABA.
    const business = await this.request<{ id?: string }>(
      credentials,
      credentials.businessAccountId,
      'GET',
      { fields: 'id' },
    );
    if (business.id !== credentials.businessAccountId) {
      throw new BadRequestException('Meta did not validate the requested WABA');
    }
    let after: string | undefined;
    const seenCursors = new Set<string>();
    for (let page = 0; page < 100; page += 1) {
      const result = await this.request<MetaPhonePage>(
        credentials,
        `${credentials.businessAccountId}/phone_numbers`,
        'GET',
        {
          fields: 'id',
          limit: '100',
          ...(after ? { after } : {}),
        },
      );
      if (!Array.isArray(result.data)) {
        throw new BadGatewayException('Meta returned an invalid phone list');
      }
      if (result.data.some((phone) => phone.id === credentials.phoneNumberId)) {
        return this.readPhone(credentials);
      }
      if (!result.paging?.next) {
        throw new BadRequestException('The requested phone does not belong to the accessible WABA');
      }
      // Never follow provider-supplied URLs (may include tokens); rebuild a fixed Graph URL.
      after = result.paging.cursors?.after;
      if (!after || seenCursors.has(after)) {
        throw new BadGatewayException('Meta returned invalid pagination');
      }
      seenCursors.add(after);
    }
    throw new BadGatewayException('Meta phone ownership validation exceeded the pagination limit');
  }

  readHealth(credentials: WhatsappCredentials): Promise<WhatsappPhoneHealth> {
    // Recheck membership as well as phone/token access; a phone may have moved WABAs.
    return this.validateCredentials(credentials);
  }

  async send(
    credentials: WhatsappCredentials,
    message: WhatsappSendRequest,
  ): Promise<WhatsappSendResult> {
    try {
      let content: Record<string, unknown>;
      if (message.type === 'text') {
        content = { type: 'text', text: { body: message.text } };
      } else if (message.type === 'template') {
        if (message.components !== undefined && message.bodyParameters !== undefined) {
          throw new Error('Ambiguous template parameters');
        }
        let components: readonly WhatsappTemplateComponent[] | undefined = message.components;
        if (message.bodyParameters !== undefined) {
          if (!Array.isArray(message.bodyParameters))
            throw new Error('Invalid template parameters');
          components = message.bodyParameters.length
            ? [
                {
                  type: 'body',
                  parameters: message.bodyParameters.map((text) => ({ type: 'text', text })),
                },
              ]
            : [];
        }
        content = {
          type: 'template',
          template: {
            name: message.templateName,
            language: { code: message.language },
            ...(components !== undefined ? { components } : {}),
          },
        };
      } else if (message.type === 'interactive') {
        content = { type: 'interactive', interactive: message.interactive };
      } else if (['image', 'video', 'audio', 'document'].includes(message.type)) {
        content = { type: message.type, [message.type]: message.media };
      } else {
        throw new Error('Unsupported capability');
      }
      return await this.sendContent(credentials, message.to, content);
    } catch (error: unknown) {
      if (error instanceof WhatsappProviderError) throw error;
      throw new WhatsappProviderError('NOT_SUBMITTED', false);
    }
  }

  async sendContent(
    credentials: WhatsappCredentials,
    to: string,
    content: Readonly<Record<string, unknown>>,
  ): Promise<WhatsappSendResult> {
    let submitted = false;
    try {
      assertWhatsappCredentials(credentials);
      validateWhatsappApiVersion(this.apiVersion);
      if (typeof to !== 'string' || !/^[1-9][0-9]{6,14}$/.test(to))
        throw new Error('Invalid recipient');
      // Rebuild every nested object from allowlisted fields. Central policy remains
      // responsible for consent, the service window, usage and idempotency.
      const normalized = this.normalizeContent(content);
      submitted = true;
      const result = await this.request<{ messages?: Array<{ id?: string }> }>(
        credentials,
        `${credentials.phoneNumberId}/messages`,
        'POST',
        undefined,
        { messaging_product: 'whatsapp', recipient_type: 'individual', to, ...normalized },
      );
      const providerMessageId = Array.isArray(result.messages) ? result.messages[0]?.id : undefined;
      if (
        typeof providerMessageId !== 'string' ||
        !providerMessageId.startsWith('wamid.') ||
        providerMessageId.length > 1024
      )
        throw new WhatsappProviderError('AMBIGUOUS', false);
      return { provider: this.name, providerMessageId };
    } catch (error: unknown) {
      if (error instanceof WhatsappProviderError) throw error;
      throw new WhatsappProviderError(submitted ? 'AMBIGUOUS' : 'NOT_SUBMITTED', false);
    }
  }

  private normalizeContent(value: unknown): Record<string, unknown> {
    const content = this.record(value);
    const type = content.type;
    if (
      typeof type !== 'string' ||
      !['text', 'template', 'image', 'video', 'audio', 'document', 'interactive'].includes(type)
    ) {
      throw new Error('Unsupported capability');
    }
    this.only(content, ['type', type]);
    if (type === 'text') {
      const text = this.record(content.text);
      this.only(text, ['body', 'preview_url']);
      const body = this.text(text.body, 4096);
      if (text.preview_url !== undefined && typeof text.preview_url !== 'boolean')
        throw new Error('Invalid preview flag');
      return {
        type,
        text: {
          body,
          ...(text.preview_url !== undefined ? { preview_url: text.preview_url } : {}),
        },
      };
    }
    if (type === 'template') {
      const template = this.record(content.template);
      const language = this.record(template.language);
      this.only(template, ['name', 'language', 'components']);
      this.only(language, ['code']);
      const name = this.text(template.name, 512);
      const code = this.text(language.code, 10);
      if (!/^[a-z0-9_]+$/.test(name) || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(code))
        throw new Error('Invalid template');
      const components = template.components === undefined ? [] : template.components;
      if (!Array.isArray(components) || components.length > 12)
        throw new Error('Invalid template components');
      const seen = new Set<string>();
      let urls = 0;
      let coupons = 0;
      const normalized = components.map((value: unknown) => {
        const component = this.normalizeTemplateComponent(value);
        const key =
          component.type === 'button'
            ? `button:${String(component.index)}`
            : String(component.type);
        if (seen.has(key)) throw new Error('Duplicate template component');
        seen.add(key);
        if (component.sub_type === 'url' && ++urls > 2) throw new Error('Too many URL buttons');
        if (component.sub_type === 'copy_code' && ++coupons > 1)
          throw new Error('Too many copy-code buttons');
        return component;
      });
      return {
        type,
        template: {
          name,
          language: { code },
          ...(normalized.length ? { components: normalized } : {}),
        },
      };
    }
    if (type === 'interactive')
      return { type, interactive: this.normalizeInteractive(content.interactive) };
    return { type, [type]: this.normalizeMedia(content[type], type, true) };
  }

  private normalizeTemplateComponent(value: unknown): Record<string, unknown> {
    const component = this.record(value);
    if (component.type === 'header' || component.type === 'body') {
      this.only(component, ['type', 'parameters']);
      const parameters = component.parameters;
      if (
        !Array.isArray(parameters) ||
        parameters.length > 100 ||
        (component.type === 'header' && parameters.length !== 1)
      )
        throw new Error('Invalid component parameters');
      if (component.type === 'header') {
        const parameter = this.record(parameters[0]);
        if (parameter.type === 'text')
          return { type: 'header', parameters: [this.templateTextParameter(parameter, 60, true)] };
        if (
          typeof parameter.type !== 'string' ||
          !['image', 'video', 'document'].includes(parameter.type)
        )
          throw new Error('Invalid header parameter');
        this.only(parameter, ['type', parameter.type]);
        return {
          type: 'header',
          parameters: [
            {
              type: parameter.type,
              [parameter.type]: this.normalizeMedia(
                parameter[parameter.type],
                parameter.type,
                false,
              ),
            },
          ],
        };
      }
      const normalized = parameters.map((parameter: unknown) =>
        this.templateTextParameter(parameter, 32768, true),
      );
      const named = normalized.filter((parameter) => parameter.parameter_name !== undefined);
      if (
        named.length &&
        (named.length !== normalized.length ||
          new Set(named.map((parameter) => parameter.parameter_name)).size !== named.length)
      ) {
        throw new Error('Invalid named parameters');
      }
      return { type: 'body', parameters: normalized };
    }
    if (component.type !== 'button') throw new Error('Unsupported template component');
    this.only(component, ['type', 'sub_type', 'index', 'parameters']);
    const index = component.index;
    if (
      !(
        (typeof index === 'number' && Number.isInteger(index) && index >= 0 && index <= 9) ||
        (typeof index === 'string' && /^[0-9]$/.test(index))
      ) ||
      !Array.isArray(component.parameters) ||
      component.parameters.length !== 1
    )
      throw new Error('Invalid template button');
    const parameter = this.record(component.parameters[0]);
    let normalized: Record<string, unknown> | WhatsappTemplateTextParameter;
    if (component.sub_type === 'url') {
      normalized = this.templateTextParameter(parameter, 2000, false);
    } else if (component.sub_type === 'quick_reply') {
      this.only(parameter, ['type', 'payload']);
      if (parameter.type !== 'payload') throw new Error('Invalid quick reply');
      normalized = { type: 'payload', payload: this.text(parameter.payload, 128) };
    } else if (component.sub_type === 'copy_code') {
      this.only(parameter, ['type', 'coupon_code']);
      if (parameter.type !== 'coupon_code') throw new Error('Invalid coupon code');
      normalized = { type: 'coupon_code', coupon_code: this.text(parameter.coupon_code, 20) };
    } else throw new Error('Unsupported template button');
    return {
      type: 'button',
      sub_type: component.sub_type,
      index: String(index),
      parameters: [normalized],
    };
  }

  private templateTextParameter(
    value: unknown,
    max: number,
    allowNamed: boolean,
  ): WhatsappTemplateTextParameter {
    const parameter = this.record(value);
    this.only(parameter, allowNamed ? ['type', 'text', 'parameter_name'] : ['type', 'text']);
    if (parameter.type !== 'text') throw new Error('Unsupported template parameter');
    const text = this.text(parameter.text, max);
    if (/[\r\n\t]| {5}/.test(text)) throw new Error('Invalid template whitespace');
    let name: string | undefined;
    if (parameter.parameter_name !== undefined) {
      name = this.text(parameter.parameter_name, 255);
      if (!/^[a-z_]+$/.test(name)) throw new Error('Invalid parameter name');
    }
    return { type: 'text', text, ...(name !== undefined ? { parameter_name: name } : {}) };
  }

  private normalizeMedia(
    value: unknown,
    type: string,
    allowCaption: boolean,
  ): Record<string, unknown> {
    const media = this.record(value);
    const captionAllowed = allowCaption && ['image', 'video', 'document'].includes(type);
    this.only(media, [
      'id',
      'link',
      ...(captionAllowed ? ['caption'] : []),
      ...(type === 'document' ? ['filename'] : []),
    ]);
    // Exactly one reference. Never download/resolve the asset inside the CRM backend.
    if ('id' in media === 'link' in media) throw new Error('Choose one media reference');
    const result: Record<string, unknown> = {};
    if ('id' in media) {
      const id = this.text(media.id, 64);
      if (!/^[1-9][0-9]{0,63}$/.test(id)) throw new Error('Invalid media ID');
      result.id = id;
    } else {
      const link = this.text(media.link, 4096);
      if (/\s|\\/.test(link)) throw new Error('Invalid media URL');
      const url = new URL(link);
      const host = url.hostname.toLowerCase();
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.hash ||
        (url.port && url.port !== '443') ||
        isIP(host) ||
        host.startsWith('[') ||
        !host.includes('.') ||
        host.endsWith('.') ||
        /(^|\.)(localhost|local|internal|lan|home|test|invalid|example)$/.test(host) ||
        !/^[a-z0-9.-]+$/.test(host) ||
        host.split('.').some((label) => !label || label.startsWith('-') || label.endsWith('-'))
      ) {
        throw new Error('Media requires a public HTTPS URL');
      }
      result.link = url.href;
    }
    if (media.caption !== undefined) result.caption = this.text(media.caption, 1024);
    if (media.filename !== undefined) {
      const filename = this.text(media.filename, 255);
      if (
        filename.includes('/') ||
        filename.includes('\\') ||
        [...filename].some((character) => character.charCodeAt(0) < 32)
      )
        throw new Error('Invalid filename');
      result.filename = filename;
    }
    return result;
  }

  private normalizeInteractive(value: unknown): Record<string, unknown> {
    const interactive = this.record(value);
    this.only(interactive, ['type', 'header', 'body', 'footer', 'action']);
    if (interactive.type !== 'button' && interactive.type !== 'list')
      throw new Error('Unsupported interactive message');
    const result: Record<string, unknown> = {
      type: interactive.type,
      body: this.textObject(interactive.body, 1024),
    };
    if (interactive.footer !== undefined) result.footer = this.textObject(interactive.footer, 60);
    if (interactive.header !== undefined) {
      const header = this.record(interactive.header);
      if (header.type === 'text') {
        this.only(header, ['type', 'text']);
        result.header = { type: 'text', text: this.text(header.text, 60) };
      } else {
        if (
          interactive.type !== 'button' ||
          typeof header.type !== 'string' ||
          !['image', 'video', 'document'].includes(header.type)
        )
          throw new Error('Unsupported interactive header');
        this.only(header, ['type', header.type]);
        result.header = {
          type: header.type,
          [header.type]: this.normalizeMedia(header[header.type], header.type, false),
        };
      }
    }
    const action = this.record(interactive.action);
    const ids = new Set<string>();
    if (interactive.type === 'button') {
      this.only(action, ['buttons']);
      if (!Array.isArray(action.buttons) || !action.buttons.length || action.buttons.length > 3)
        throw new Error('Invalid reply buttons');
      const titles = new Set<string>();
      result.action = {
        buttons: action.buttons.map((value: unknown) => {
          const button = this.record(value);
          this.only(button, ['type', 'reply']);
          const reply = this.record(button.reply);
          this.only(reply, ['id', 'title']);
          const id = this.text(reply.id, 256);
          const title = this.text(reply.title, 20);
          if (button.type !== 'reply' || id !== id.trim() || ids.has(id) || titles.has(title))
            throw new Error('Invalid reply button');
          ids.add(id);
          titles.add(title);
          return { type: 'reply', reply: { id, title } };
        }),
      };
    } else {
      this.only(action, ['button', 'sections']);
      if (!Array.isArray(action.sections) || !action.sections.length || action.sections.length > 10)
        throw new Error('Invalid list sections');
      const sectionCount = action.sections.length;
      let rowCount = 0;
      result.action = {
        button: this.text(action.button, 20),
        sections: action.sections.map((value: unknown) => {
          const section = this.record(value);
          this.only(section, ['title', 'rows']);
          const title = section.title !== undefined ? this.text(section.title, 24) : undefined;
          if (sectionCount > 1 && title === undefined) throw new Error('Section titles required');
          if (!Array.isArray(section.rows) || !section.rows.length || section.rows.length > 10)
            throw new Error('Invalid list rows');
          rowCount += section.rows.length;
          if (rowCount > 10) throw new Error('Too many list rows');
          const rows = section.rows.map((value: unknown) => {
            const row = this.record(value);
            this.only(row, ['id', 'title', 'description']);
            const id = this.text(row.id, 200);
            if (ids.has(id)) throw new Error('Duplicate row ID');
            ids.add(id);
            return {
              id,
              title: this.text(row.title, 24),
              ...(row.description !== undefined
                ? { description: this.text(row.description, 72) }
                : {}),
            };
          });
          return { ...(title !== undefined ? { title } : {}), rows };
        }),
      };
    }
    return result;
  }

  private textObject(value: unknown, max: number): { text: string } {
    const object = this.record(value);
    this.only(object, ['text']);
    return { text: this.text(object.text, max) };
  }

  private text(value: unknown, max: number): string {
    if (typeof value !== 'string' || !value.trim() || value.length > max || value.includes('\0')) {
      throw new Error('Invalid text');
    }
    return value;
  }

  private only(object: Record<string, unknown>, keys: readonly string[]): void {
    if (Object.keys(object).some((key) => !keys.includes(key)))
      throw new Error('Unsupported field');
  }

  private record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Invalid message object');
    return value as Record<string, unknown>;
  }

  private async readPhone(credentials: WhatsappCredentials): Promise<WhatsappPhoneHealth> {
    const phone = await this.request<MetaPhone>(credentials, credentials.phoneNumberId, 'GET', {
      fields: 'id,display_phone_number,verified_name,quality_rating,code_verification_status',
    });
    if (phone.id !== credentials.phoneNumberId) {
      throw new BadGatewayException('Meta returned a different phone ID');
    }
    return {
      phoneNumberId: phone.id,
      displayPhoneNumber:
        typeof phone.display_phone_number === 'string'
          ? phone.display_phone_number.slice(0, 64)
          : null,
      verifiedName:
        typeof phone.verified_name === 'string' ? phone.verified_name.slice(0, 255) : null,
      qualityRating:
        phone.quality_rating === 'GREEN' ||
        phone.quality_rating === 'YELLOW' ||
        phone.quality_rating === 'RED'
          ? phone.quality_rating
          : 'UNKNOWN',
      codeVerificationStatus:
        phone.code_verification_status === 'VERIFIED' ||
        phone.code_verification_status === 'NOT_VERIFIED' ||
        phone.code_verification_status === 'EXPIRED'
          ? phone.code_verification_status
          : 'UNKNOWN',
    };
  }

  private async request<T>(
    credentials: WhatsappCredentials,
    path: string,
    method: 'GET' | 'POST',
    params?: Record<string, string>,
    data?: Record<string, unknown>,
  ): Promise<T> {
    // Recheck expiration for long-running processes, not just at boot.
    validateWhatsappApiVersion(this.apiVersion);
    try {
      const response = await axios.request<T>({
        url: `https://graph.facebook.com/${this.apiVersion}/${path}`,
        method,
        params,
        data,
        timeout: 15000,
        maxRedirects: 0,
        maxContentLength: 2 * 1024 * 1024,
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid provider response');
      }
      return response.data;
    } catch (error: unknown) {
      // Never expose/chain/log Axios errors: config contains the Authorization token.
      if (method === 'POST') {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const meta = isAxiosError(error)
          ? (
              error.response?.data as
                | { error?: { code?: unknown; is_transient?: unknown } }
                | undefined
            )?.error
          : undefined;
        const providerCode =
          typeof meta?.code === 'number' && Number.isSafeInteger(meta.code) && meta.code >= 0
            ? meta.code
            : undefined;
        // HTTP 408, 5xx, transport errors, and malformed success responses may have
        // accepted a send. They are never safe automatic retries without reconciliation.
        const rejected = status !== undefined && status >= 400 && status < 500 && status !== 408;
        throw new WhatsappProviderError(
          rejected ? 'REJECTED' : 'AMBIGUOUS',
          rejected && (status === 429 || meta?.is_transient === true),
          status,
          providerCode,
        );
      }
      if (isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0)) {
        throw new BadRequestException(
          'Meta rejected the credentials or request; verify account access and permissions',
        );
      }
      throw new BadGatewayException('Meta WhatsApp request failed');
    }
  }
}

@Injectable()
export class WhatsappProviderRegistry {
  constructor(private readonly meta: MetaWhatsappProvider) {}

  get(provider: WhatsappProviderName): WhatsappProvider {
    if (provider !== 'meta') {
      throw new BadRequestException('Unsupported WhatsApp provider');
    }
    return this.meta;
  }

  capabilities(provider: WhatsappProviderName): Readonly<WhatsappCapabilities> {
    return this.get(provider).capabilities;
  }
}
