import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { MarketplaceTemplate } from '../../database/entities/marketplace-template.entity';
import {
  CreateMarketplaceTemplateDto,
  UpdateMarketplaceTemplateDto,
} from './marketplace-template.dto';

@Injectable()
export class MarketplaceTemplateService {
  constructor(
    @InjectRepository(MarketplaceTemplate)
    private readonly templateRepo: Repository<MarketplaceTemplate>,
  ) {}

  async create(tenantId: string, dto: CreateMarketplaceTemplateDto): Promise<MarketplaceTemplate> {
    const template = this.templateRepo.create({
      ...dto,
      tenantId,
    } as any) as unknown as MarketplaceTemplate;
    return this.templateRepo.save(template) as unknown as Promise<MarketplaceTemplate>;
  }

  async findAll(category?: string, type?: string): Promise<MarketplaceTemplate[]> {
    const where: any = { published: true };
    if (category) where.category = category;
    if (type) where.type = type;
    return this.templateRepo.find({ where, order: { installCount: 'DESC' } });
  }

  /**
   * Visible = published, or (when an authenticated tenant is known) owned by it.
   * Public routes must not pass a tenantId: there it would come from the
   * client-controlled x-tenant-id header.
   */
  async findOne(id: string, viewerTenantId?: string): Promise<MarketplaceTemplate> {
    const where: FindOptionsWhere<MarketplaceTemplate>[] = [{ id, published: true }];
    if (viewerTenantId) where.push({ id, tenantId: viewerTenantId });
    const t = await this.templateRepo.findOne({ where });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  async install(
    tenantId: string,
    templateId: string,
  ): Promise<{ installed: boolean; content: Record<string, unknown> }> {
    const t = await this.findOne(templateId, tenantId);
    t.installCount += 1;
    await this.templateRepo.save(t);
    return { installed: true, content: t.content };
  }

  async publish(tenantId: string, id: string): Promise<MarketplaceTemplate> {
    const t = await this.templateRepo.findOne({ where: { id, tenantId } as any });
    if (!t) throw new NotFoundException('Template not found');
    t.published = true;
    return this.templateRepo.save(t) as unknown as Promise<MarketplaceTemplate>;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateMarketplaceTemplateDto,
  ): Promise<MarketplaceTemplate> {
    const t = await this.templateRepo.findOne({ where: { id, tenantId } as any });
    if (!t) throw new NotFoundException('Template not found');
    Object.assign(t, dto);
    return this.templateRepo.save(t) as unknown as Promise<MarketplaceTemplate>;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const t = await this.templateRepo.findOne({ where: { id, tenantId } as any });
    if (!t) throw new NotFoundException('Template not found');
    await this.templateRepo.softRemove(t);
  }
}
