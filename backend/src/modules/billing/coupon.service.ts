import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../../database/entities/coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  async create(tenantId: string, dto: Partial<Coupon>): Promise<Coupon> {
    const existing = await this.couponRepo.findOne({ where: { tenantId, code: dto.code } as any });
    if (existing) throw new BadRequestException('Coupon code already exists');
    const coupon = this.couponRepo.create({ ...dto, tenantId } as any) as unknown as Coupon;
    return this.couponRepo.save(coupon) as unknown as Promise<Coupon>;
  }

  async findAll(tenantId: string): Promise<Coupon[]> {
    return this.couponRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id, tenantId } as any });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async validate(tenantId: string, code: string, orderAmount?: number): Promise<{ valid: boolean; discount: number; coupon?: Coupon }> {
    const coupon = await this.couponRepo.findOne({ where: { tenantId, code, active: true } as any });
    if (!coupon) return { valid: false, discount: 0 };

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) return { valid: false, discount: 0 };
    if (coupon.validUntil && coupon.validUntil < now) return { valid: false, discount: 0 };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0 };
    if (coupon.minAmount && orderAmount && orderAmount < Number(coupon.minAmount)) {
      return { valid: false, discount: 0 };
    }

    const discount = coupon.discountType === 'PERCENTAGE'
      ? (orderAmount || 0) * Number(coupon.discountValue) / 100
      : Number(coupon.discountValue);

    return { valid: true, discount, coupon };
  }

  async redeem(tenantId: string, code: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { tenantId, code, active: true } as any });
    if (!coupon) throw new NotFoundException('Coupon not found or inactive');
    coupon.usedCount += 1;
    return this.couponRepo.save(coupon) as unknown as Promise<Coupon>;
  }

  async update(tenantId: string, id: string, dto: Partial<Coupon>): Promise<Coupon> {
    const coupon = await this.findOne(tenantId, id);
    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon) as unknown as Promise<Coupon>;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const coupon = await this.findOne(tenantId, id);
    await this.couponRepo.softRemove(coupon);
  }
}
