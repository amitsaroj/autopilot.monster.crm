import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletTransaction } from '../../database/entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
  ) {}

  async getOrCreate(tenantId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { tenantId } as any });
    if (!wallet) {
      const created = this.walletRepo.create({ tenantId, balance: 0, currency: 'USD' } as any) as unknown as Wallet;
      wallet = await this.walletRepo.save(created) as unknown as Wallet;
    }
    return wallet!;
  }

  async getBalance(tenantId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getOrCreate(tenantId);
    return { balance: Number(wallet.balance), currency: wallet.currency };
  }

  async credit(tenantId: string, amount: number, source: WalletTransaction['source'], description?: string, referenceId?: string): Promise<WalletTransaction> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.getOrCreate(tenantId);
    wallet.balance = Number(wallet.balance) + amount;
    wallet.totalCredited = Number(wallet.totalCredited) + amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      tenantId,
      walletId: wallet.id,
      type: 'CREDIT',
      amount,
      source,
      description,
      referenceId,
    } as any) as unknown as WalletTransaction;
    return this.txRepo.save(tx) as unknown as Promise<WalletTransaction>;
  }

  async debit(tenantId: string, amount: number, source: WalletTransaction['source'], description?: string, referenceId?: string): Promise<WalletTransaction> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.getOrCreate(tenantId);
    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balance = Number(wallet.balance) - amount;
    wallet.totalDebited = Number(wallet.totalDebited) + amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      tenantId,
      walletId: wallet.id,
      type: 'DEBIT',
      amount,
      source,
      description,
      referenceId,
    } as any) as unknown as WalletTransaction;
    return this.txRepo.save(tx) as unknown as Promise<WalletTransaction>;
  }

  async getTransactions(tenantId: string, page = 1, limit = 20): Promise<{ data: WalletTransaction[]; total: number }> {
    const wallet = await this.getOrCreate(tenantId);
    const [data, total] = await this.txRepo.findAndCount({
      where: { walletId: wallet.id } as any,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }
}
