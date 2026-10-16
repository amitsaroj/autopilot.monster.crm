import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsArray,
  IsEnum,
  IsInt,
  Max,
  MaxLength,
  Min,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isUUID,
} from 'class-validator';
import {
  WhatsAppBroadcastApprovalStatus,
  WhatsAppBroadcastRecurrence,
} from '../../../database/entities/whatsapp-broadcast.entity';

type JsonObject = Record<string, unknown>;
function object(value: unknown): value is JsonObject {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value))
  );
}
function keys(value: JsonObject, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}
function string(value: unknown): value is string {
  return typeof value === 'string';
}
function parameter(value: unknown): boolean {
  if (!object(value) || !string(value.type)) return false;
  switch (value.type) {
    case 'text':
    case 'payload':
    case 'coupon_code':
      return keys(value, ['type', value.type]) && string(value[value.type]);
    case 'image':
    case 'video':
    case 'document': {
      const media = value[value.type];
      return (
        keys(value, ['type', value.type]) &&
        object(media) &&
        keys(media, value.type === 'document' ? ['id', 'link', 'filename'] : ['id', 'link']) &&
        ((string(media.id) && !!media.id && media.link === undefined) ||
          (string(media.link) && /^https?:\/\//.test(media.link) && media.id === undefined)) &&
        (media.filename === undefined || string(media.filename))
      );
    }
    case 'currency': {
      const currency = value.currency;
      return (
        keys(value, ['type', 'currency']) &&
        object(currency) &&
        keys(currency, ['fallback_value', 'code', 'amount_1000']) &&
        string(currency.fallback_value) &&
        string(currency.code) &&
        /^[A-Z]{3}$/.test(currency.code) &&
        Number.isSafeInteger(currency.amount_1000)
      );
    }
    case 'date_time':
      return (
        keys(value, ['type', 'date_time']) &&
        object(value.date_time) &&
        keys(value.date_time, ['fallback_value']) &&
        string(value.date_time.fallback_value)
      );
    default:
      return false;
  }
}
/** Explicit JSON schemas reject unknown keys and malformed nested objects regardless of pipe whitelist options. */
export function isBroadcastJson(value: unknown, property: string): boolean {
  if (property === 'templateVariables')
    return (
      object(value) &&
      Object.entries(value).every(
        ([key, item]) => !['__proto__', 'constructor', 'prototype'].includes(key) && string(item),
      )
    );
  if (property === 'templateComponents')
    return (
      Array.isArray(value) &&
      value.every((component) => {
        if (
          !object(component) ||
          !keys(component, ['type', 'parameters', 'sub_type', 'index']) ||
          !['header', 'body', 'button'].includes(String(component.type)) ||
          !Array.isArray(component.parameters) ||
          !component.parameters.every(parameter)
        )
          return false;
        if (component.type === 'button')
          return (
            ['quick_reply', 'url', 'copy_code'].includes(String(component.sub_type)) &&
            string(component.index) &&
            /^[0-9]$/.test(component.index)
          );
        return component.sub_type === undefined && component.index === undefined;
      })
    );
  if (
    property !== 'contactFilter' ||
    !object(value) ||
    !keys(value, [
      'tags',
      'status',
      'segmentIds',
      'customField',
      'excludeTags',
      'excludeContactIds',
      'frequencyCap',
      'maxRecipients',
    ])
  )
    return false;
  if (value.tags !== undefined && (!Array.isArray(value.tags) || !value.tags.every(string)))
    return false;
  if (
    value.excludeTags !== undefined &&
    (!Array.isArray(value.excludeTags) ||
      value.excludeTags.length > 100 ||
      !value.excludeTags.every((item) => string(item) && item.length <= 100))
  )
    return false;
  if (
    value.excludeContactIds !== undefined &&
    (!Array.isArray(value.excludeContactIds) ||
      value.excludeContactIds.length > 500 ||
      !value.excludeContactIds.every((item) => string(item) && isUUID(item)))
  )
    return false;
  if (
    value.maxRecipients !== undefined &&
    (!Number.isSafeInteger(value.maxRecipients) ||
      Number(value.maxRecipients) < 1 ||
      Number(value.maxRecipients) > 1000000)
  )
    return false;
  if (value.frequencyCap !== undefined) {
    const cap = value.frequencyCap;
    if (
      !object(cap) ||
      !keys(cap, ['maxMessages', 'windowHours']) ||
      !Number.isSafeInteger(cap.maxMessages) ||
      Number(cap.maxMessages) < 1 ||
      Number(cap.maxMessages) > 100 ||
      !Number.isSafeInteger(cap.windowHours) ||
      Number(cap.windowHours) < 1 ||
      Number(cap.windowHours) > 720
    )
      return false;
  }
  if (
    value.status !== undefined &&
    (!Array.isArray(value.status) ||
      !value.status.every((item) => ['LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED'].includes(item)))
  )
    return false;
  if (
    value.segmentIds !== undefined &&
    (!Array.isArray(value.segmentIds) ||
      !value.segmentIds.every((item) => string(item) && isUUID(item)))
  )
    return false;
  return (
    value.customField === undefined ||
    (object(value.customField) &&
      keys(value.customField, ['key', 'value']) &&
      string(value.customField.key) &&
      !!value.customField.key &&
      string(value.customField.value))
  );
}
@ValidatorConstraint({ name: 'broadcastJson', async: false })
class BroadcastJsonConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    return isBroadcastJson(value, args.property);
  }
  defaultMessage(args: ValidationArguments): string {
    return `${args.property} has unknown keys or invalid nested values`;
  }
}

export class CreateWhatsappBroadcastDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsUUID()
  templateId!: string;

  @ApiPropertyOptional({
    description:
      'Connected Meta provider phone number ID. Required when multiple accounts are connected.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]{0,63}$/)
  phoneNumberId?: string;

  @ApiPropertyOptional({
    description:
      'Numeric parameter keys; header.1/body.1 override shared 1. Values may contain CRM placeholders.',
  })
  @IsObject()
  @IsOptional()
  @Validate(BroadcastJsonConstraint)
  templateVariables?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Meta send components; text parameters may use CRM placeholders',
  })
  @IsArray()
  @IsOptional()
  @Validate(BroadcastJsonConstraint)
  templateComponents?: unknown[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @Validate(BroadcastJsonConstraint)
  contactFilter?: {
    tags?: string[];
    status?: string[];
    segmentIds?: string[];
    customField?: { key: string; value: string };
    excludeTags?: string[];
    excludeContactIds?: string[];
    frequencyCap?: { maxMessages: number; windowHours: number };
    maxRecipients?: number;
  };

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Optional recipient-local HH:mm send time for a scheduled one-time broadcast.',
    nullable: true,
    example: '09:00',
  })
  @IsOptional()
  @Matches(/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/)
  recipientLocalTime?: string | null;

  @ApiPropertyOptional({ enum: WhatsAppBroadcastRecurrence })
  @IsOptional()
  @IsEnum(WhatsAppBroadcastRecurrence)
  recurrenceFrequency?: WhatsAppBroadcastRecurrence;

  @ApiPropertyOptional({
    description: 'Inclusive UTC end date; required when no count is supplied.',
  })
  @IsOptional()
  @IsDateString()
  recurrenceEndAt?: string;

  @ApiPropertyOptional({
    minimum: 2,
    maximum: 366,
    description: 'Total occurrences including the first.',
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(366)
  recurrenceMaxOccurrences?: number;
}

export class ScheduleWhatsappBroadcastDto {
  @ApiProperty()
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional({
    description: 'Optional recipient-local HH:mm send time; null disables local-time scheduling.',
    nullable: true,
    example: '09:00',
  })
  @IsOptional()
  @Matches(/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/)
  recipientLocalTime?: string | null;

  @ApiPropertyOptional({ enum: WhatsAppBroadcastRecurrence })
  @IsOptional()
  @IsEnum(WhatsAppBroadcastRecurrence)
  recurrenceFrequency?: WhatsAppBroadcastRecurrence;

  @ApiPropertyOptional({
    description: 'Inclusive UTC end date; required when no count is supplied.',
  })
  @IsOptional()
  @IsDateString()
  recurrenceEndAt?: string;

  @ApiPropertyOptional({
    minimum: 2,
    maximum: 366,
    description: 'Total occurrences including the first.',
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(366)
  recurrenceMaxOccurrences?: number;
}

export class ReviewWhatsappBroadcastApprovalDto {
  @ApiProperty({
    enum: [WhatsAppBroadcastApprovalStatus.APPROVED, WhatsAppBroadcastApprovalStatus.REJECTED],
  })
  @IsEnum({
    APPROVED: WhatsAppBroadcastApprovalStatus.APPROVED,
    REJECTED: WhatsAppBroadcastApprovalStatus.REJECTED,
  })
  decision!: WhatsAppBroadcastApprovalStatus.APPROVED | WhatsAppBroadcastApprovalStatus.REJECTED;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
