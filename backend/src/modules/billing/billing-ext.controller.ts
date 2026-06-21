import {
  Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CouponService } from './coupon.service';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Wallet & Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('billing')
export class BillingExtController {
  constructor(
    private readonly walletService: WalletService,
    private readonly couponService: CouponService,
  ) {}

  // --- Wallet ---
  @Get('wallet')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@TenantId() tenantId: string) {
    return this.walletService.getBalance(tenantId);
  }

  @Post('wallet/topup')
  @ApiOperation({ summary: 'Top up wallet credits' })
  async topUp(@TenantId() tenantId: string, @Body() body: { amount: number; description?: string }) {
    return this.walletService.credit(tenantId, body.amount, 'TOPUP', body.description);
  }

  @Get('wallet/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  async getTransactions(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactions(tenantId, Number(page) || 1, Number(limit) || 20);
  }

  // --- Coupons ---
  @Post('coupons')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a coupon' })
  async createCoupon(@TenantId() tenantId: string, @Body() dto: any) {
    return this.couponService.create(tenantId, dto);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List all coupons' })
  async listCoupons(@TenantId() tenantId: string) {
    return this.couponService.findAll(tenantId);
  }

  @Post('coupons/validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validateCoupon(
    @TenantId() tenantId: string,
    @Body() body: { code: string; amount?: number },
  ) {
    return this.couponService.validate(tenantId, body.code, body.amount);
  }

  @Post('coupons/:code/redeem')
  @ApiOperation({ summary: 'Redeem a coupon' })
  async redeemCoupon(@TenantId() tenantId: string, @Param('code') code: string) {
    return this.couponService.redeem(tenantId, code);
  }

  @Patch('coupons/:id')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a coupon' })
  async updateCoupon(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.couponService.update(tenantId, id, dto);
  }

  @Delete('coupons/:id')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.couponService.remove(tenantId, id);
  }
}
