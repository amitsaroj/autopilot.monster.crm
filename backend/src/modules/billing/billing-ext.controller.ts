import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';

@ApiTags('Billing Coupons')
@ApiBearerAuth()
@ResourcePermissions('billing')
@PlanFeature('billing')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('billing/coupons')
export class BillingExtController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a coupon' })
  async createCoupon(@TenantId() tenantId: string, @Body() dto: Record<string, unknown>) {
    const data = await this.couponService.create(tenantId, dto);
    return { status: 201, message: 'Coupon created', error: false, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all coupons' })
  async listCoupons(@TenantId() tenantId: string) {
    const data = await this.couponService.findAll(tenantId);
    return { status: 200, message: 'Coupons retrieved', error: false, data };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validateCoupon(
    @TenantId() tenantId: string,
    @Body() body: { code: string; amount?: number },
  ) {
    const data = await this.couponService.validate(tenantId, body.code, body.amount);
    return { status: 200, message: 'Coupon validated', error: false, data };
  }

  @Post(':code/redeem')
  @ApiOperation({ summary: 'Redeem a coupon' })
  async redeemCoupon(@TenantId() tenantId: string, @Param('code') code: string) {
    const data = await this.couponService.redeem(tenantId, code);
    return { status: 200, message: 'Coupon redeemed', error: false, data };
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a coupon' })
  async updateCoupon(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    const data = await this.couponService.update(tenantId, id, dto);
    return { status: 200, message: 'Coupon updated', error: false, data };
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.couponService.remove(tenantId, id);
  }
}
