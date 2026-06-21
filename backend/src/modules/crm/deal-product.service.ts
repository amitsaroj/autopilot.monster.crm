import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DealProduct } from '../../database/entities/deal-product.entity';
import { Product } from '../../database/entities/product.entity';
import { DealService } from './deal.service';
import { AddDealProductDto } from './dto/deal-product.dto';

@Injectable()
export class DealProductService {
  constructor(
    @InjectRepository(DealProduct)
    private readonly dealProductRepository: Repository<DealProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dealService: DealService,
  ) {}

  async listProducts(tenantId: string, dealId: string): Promise<DealProduct[]> {
    await this.dealService.findOne(tenantId, dealId);
    return this.dealProductRepository.find({
      where: { tenantId, dealId },
      relations: ['product'],
      order: { createdAt: 'ASC' },
    });
  }

  async addProduct(
    tenantId: string,
    dealId: string,
    dto: AddDealProductDto,
  ): Promise<DealProduct> {
    await this.dealService.findOne(tenantId, dealId);

    const product = await this.productRepository.findOne({
      where: { id: dto.productId, tenantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.dealProductRepository.findOne({
      where: { tenantId, dealId, productId: dto.productId },
    });
    if (existing) {
      throw new ConflictException('Product already linked to deal');
    }

    return this.dealProductRepository.save(
      this.dealProductRepository.create({
        tenantId,
        dealId,
        productId: dto.productId,
        quantity: dto.quantity ?? 1,
        unitPrice: dto.unitPrice ?? product.price,
        discount: dto.discount ?? 0,
      }),
    );
  }

  async removeProduct(tenantId: string, dealId: string, productId: string): Promise<void> {
    const link = await this.dealProductRepository.findOne({
      where: { tenantId, dealId, productId },
    });
    if (!link) {
      throw new NotFoundException('Product not linked to deal');
    }
    await this.dealProductRepository.softDelete({ id: link.id, tenantId });
  }
}
