import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Repository } from 'typeorm';

import {
  WhatsAppTemplate,
  WhatsAppTemplateStatus,
} from '../../database/entities/whatsapp-template.entity';
import { CreateWhatsappTemplateDto, UpdateWhatsappTemplateDto } from './dto/whatsapp-template.dto';

@Injectable()
export class WhatsappTemplateService {
  private readonly logger = new Logger(WhatsappTemplateService.name);

  constructor(
    @InjectRepository(WhatsAppTemplate)
    private readonly templateRepository: Repository<WhatsAppTemplate>,
    private readonly configService: ConfigService,
  ) {}

  findAll(tenantId: string): Promise<WhatsAppTemplate[]> {
    return this.templateRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<WhatsAppTemplate> {
    const template = await this.templateRepository.findOne({ where: { id, tenantId } });
    if (!template) {
      throw new NotFoundException('WhatsApp template not found');
    }
    return template;
  }

  create(tenantId: string, dto: CreateWhatsappTemplateDto): Promise<WhatsAppTemplate> {
    return this.templateRepository.save(
      this.templateRepository.create({
        tenantId,
        name: dto.name,
        category: dto.category,
        language: dto.language ?? 'en_US',
        components: dto.components,
        status: WhatsAppTemplateStatus.PENDING,
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateWhatsappTemplateDto,
  ): Promise<WhatsAppTemplate> {
    const template = await this.findOne(tenantId, id);
    if (dto.name !== undefined) template.name = dto.name;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.language !== undefined) template.language = dto.language;
    if (dto.components !== undefined) template.components = dto.components;
    if (dto.status !== undefined) template.status = dto.status;
    return this.templateRepository.save(template);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.templateRepository.softDelete({ id, tenantId });
  }

  async syncWithMeta(tenantId: string, id: string): Promise<WhatsAppTemplate> {
    const template = await this.findOne(tenantId, id);
    const token = this.configService.get<string>('WHATSAPP_TOKEN');
    const businessAccountId = this.configService.get<string>('WHATSAPP_BUSINESS_ACCOUNT_ID');

    if (!token || !businessAccountId) {
      this.logger.warn(`Meta credentials missing for tenant ${tenantId}; marking template pending`);
      template.status = WhatsAppTemplateStatus.PENDING;
      return this.templateRepository.save(template);
    }

    try {
      const componentList = this.resolveTemplateComponents(template.components);
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${businessAccountId}/message_templates`,
        {
          name: template.name,
          language: template.language,
          category: template.category,
          components: componentList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      template.waTemplateId = String(response.data.id ?? '');
      template.status = WhatsAppTemplateStatus.PENDING;
      return this.templateRepository.save(template);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Meta sync failed';
      template.status = WhatsAppTemplateStatus.REJECTED;
      template.rejectionReason = message;
      return this.templateRepository.save(template);
    }
  }

  private resolveTemplateComponents(components: Record<string, unknown>): unknown[] {
    if (Array.isArray(components)) {
      return components;
    }

    const nested = components.components;
    if (Array.isArray(nested)) {
      return nested;
    }

    return [];
  }
}
