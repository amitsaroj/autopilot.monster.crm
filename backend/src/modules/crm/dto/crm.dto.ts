import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { ContactStatus } from '../../../database/entities/contact.entity';
import { DealStatus } from '../../../database/entities/deal.entity';
import { ActivityType } from '../../../database/entities/activity.entity';
import { TaskPriority, TaskStatus } from '../../../database/entities/task.entity';
import { BillingType } from '../../../database/entities/product.entity';
import { QuoteStatus } from '../../../database/entities/quote.entity';
import { CampaignType, CampaignStatus } from '../../../database/entities/campaign.entity';

export class CrmListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'acme' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  pipelineId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  companyId?: string;
}

/** Filters for activity/note feeds. `page`/`limit` switch the response to a paginated envelope. */
export class CrmFeedQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;
}

export class CampaignListQueryDto {
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;
}

export class SegmentMembersQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  mobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  sizeRange?: string;

  @IsOptional()
  @IsString()
  annualRevenueRange?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class CreateDealDto {
  @ApiProperty({ example: 'Large Enterprise Sale' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsUUID()
  pipelineId!: string;

  @IsUUID()
  stageId!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;
}

export class UpdateDealDto extends PartialType(CreateDealDto) {}

export class CreateLeadDto {
  @ApiProperty({ example: 'Jane' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Webform' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  aiSummary?: string;
}

export class BulkCreateLeadsDto {
  @ApiProperty({ type: [CreateLeadDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateLeadDto)
  leads!: CreateLeadDto[];
}

export class ConvertLeadDto {
  @IsOptional()
  @IsBoolean()
  createCompany?: boolean;

  @IsOptional()
  @IsBoolean()
  createDeal?: boolean;

  @IsOptional()
  @IsString()
  dealName?: string;

  @IsOptional()
  @IsUUID()
  pipelineId?: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Follow up call' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class CreateNoteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type!: ActivityType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  subject!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiProperty({ example: '2026-07-22T12:00:00.000Z' })
  @IsOptional()
  @IsString()
  occurredAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  outcome?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Pro Plan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ example: 99.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsEnum(BillingType)
  billingType?: BillingType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class QuoteLineItemDto {
  @IsUUID()
  productId!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qty!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount!: number;
}

export class CreateQuoteDto {
  @ApiPropertyOptional({ example: 'Q-2026-001', description: 'Generated when omitted' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  number?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems?: QuoteLineItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {}

export class CreatePipelineStageDto {
  @ApiProperty({ example: 'Qualification' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;
}

export class CreatePipelineDto {
  @ApiProperty({ example: 'Sales Pipeline' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePipelineStageDto)
  stages?: CreatePipelineStageDto[];
}

export class UpdatePipelineDto extends PartialType(OmitType(CreatePipelineDto, ['stages'])) {}

export class CreateCampaignDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

export class StartCampaignDto {
  @IsUUID()
  agentId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  leadIds!: string[];
}

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export const SEGMENT_ENTITY_TYPES = ['LEAD', 'CONTACT', 'COMPANY', 'DEAL'] as const;
export type SegmentEntityType = (typeof SEGMENT_ENTITY_TYPES)[number];
export const SEGMENT_OPERATORS = [
  'eq',
  'equals',
  'neq',
  'contains',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
] as const;
export type SegmentOperator = (typeof SEGMENT_OPERATORS)[number];

export class SegmentConditionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  field!: string;

  @IsOptional()
  @IsIn(SEGMENT_OPERATORS)
  operator?: SegmentOperator;

  @IsDefined()
  value!: string | number | boolean | Array<string | number>;
}

export class SegmentRulesDto {
  @IsIn(['AND', 'OR'])
  operator!: 'AND' | 'OR';

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SegmentConditionDto)
  conditions!: SegmentConditionDto[];
}

export class CreateSegmentDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => SegmentRulesDto)
  rules!: SegmentRulesDto;

  @IsOptional()
  @IsIn(SEGMENT_ENTITY_TYPES)
  entityType?: SegmentEntityType;
}

export class TagTargetParamsDto {
  @IsIn(['contacts', 'companies', 'deals'])
  entity!: 'contacts' | 'companies' | 'deals';

  @IsUUID()
  id!: string;
}

export class AssignTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tag!: string;
}

export const CUSTOM_FIELD_TYPES = [
  'TEXT',
  'NUMBER',
  'DATE',
  'SELECT',
  'MULTI_SELECT',
  'BOOLEAN',
] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export class CreateCustomFieldDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  label!: string;

  @IsOptional()
  @IsIn(CUSTOM_FIELD_TYPES)
  type?: CustomFieldType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsIn(['LEAD', 'CONTACT', 'COMPANY', 'DEAL', 'PRODUCT'])
  entityType?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class UpdateCustomFieldDto extends PartialType(CreateCustomFieldDto) {}

export class MergeRecordsDto {
  @ApiProperty()
  @IsUUID()
  primaryId!: string;

  @ApiProperty()
  @IsUUID()
  secondaryId!: string;
}

export class CheckDuplicateDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class BulkStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsIn(['lead', 'contact'])
  entityType!: 'lead' | 'contact';
}

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsIn(['lead', 'contact'])
  entityType!: 'lead' | 'contact';
}

export class ImportCrmDataDto {
  @IsIn(['lead', 'contact'])
  entityType!: 'lead' | 'contact';

  /** Each row is validated against CreateLeadDto / CreateContactDto in the controller. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsObject({ each: true })
  data!: Record<string, unknown>[];
}

export class SendCrmEmailDto {
  @IsEmail()
  to!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;
}
