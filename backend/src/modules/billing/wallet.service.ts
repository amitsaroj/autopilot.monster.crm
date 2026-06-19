import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wallet } from '../../database/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionType,
} from '../../database/entities/wallet-transaction.entity';
import { AddWalletCreditsDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
  ) {}

  async getOrCreateWallet(tenantId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { tenantId } });
    if (!wallet) {
      wallet = await this.walletRepository.save(
        this.walletRepository.create({ tenantId, balance: 0, currency: 'USD' }),
      );
    }
    return wallet;
  }

  async getWallet(tenantId: string): Promise<Wallet> {
    return this.getOrCreateWallet(tenantId);
  }

  async getTransactions(tenantId: string): Promise<WalletTransaction[]> {
    const wallet = await this.getOrCreateWallet(tenantId);
    return this.transactionRepository.find({
      where: { tenantId, walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async addCredits(tenantId: string, dto: AddWalletCreditsDto): Promise<Wallet> {
    return this.walletRepository.manager.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const txRepo = manager.getRepository(WalletTransaction);

      let wallet = await walletRepo.findOne({ where: { tenantId } });
      if (!wallet) {
        wallet = await walletRepo.save(
          walletRepo.create({ tenantId, balance: 0, currency: 'USD' }),
        );
      }

      const newBalance = Number(wallet.balance) + dto.amount;
      wallet.balance = newBalance;
      const saved = await walletRepo.save(wallet);

      await txRepo.save(
        txRepo.create({
          tenantId,
          walletId: wallet.id,
          type: WalletTransactionType.CREDIT,
          amount: dto.amount,
          balanceAfter: newBalance,
          description: dto.description ?? 'Credit added',
          referenceId: dto.referenceId,
        }),
      );

      return saved;
    });
  }

  async debit(
    tenantId: string,
    amount: number,
    description: string,
    referenceId?: string,
  ): Promise<Wallet> {
    return this.walletRepository.manager.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const txRepo = manager.getRepository(WalletTransaction);

      const wallet = await walletRepo.findOne({
        where: { tenantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }
      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      const newBalance = Number(wallet.balance) - amount;
      wallet.balance = newBalance;
      const saved = await walletRepo.save(wallet);

      await txRepo.save(
        txRepo.create({
          tenantId,
          walletId: wallet.id,
          type: WalletTransactionType.DEBIT,
          amount,
          balanceAfter: newBalance,
          description,
          referenceId,
        }),
      );

      return saved;
    });
  }
}
