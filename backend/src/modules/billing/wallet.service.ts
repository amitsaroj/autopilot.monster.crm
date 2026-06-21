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

  // Aliases for compatibility
  get walletRepo() {
    return this.walletRepository;
  }
  get txRepo() {
    return this.transactionRepository;
  }

  async getOrCreateWallet(tenantId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { tenantId } });
    if (!wallet) {
      wallet = await this.walletRepository.save(
        this.walletRepository.create({ tenantId, balance: 0, currency: 'USD' }),
      );
    }
    return wallet;
  }

  async getOrCreate(tenantId: string): Promise<Wallet> {
    return this.getOrCreateWallet(tenantId);
  }

  async getWallet(tenantId: string): Promise<Wallet> {
    return this.getOrCreateWallet(tenantId);
  }

  async getBalance(tenantId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getOrCreateWallet(tenantId);
    return { balance: Number(wallet.balance), currency: wallet.currency };
  }

  async getTransactions(tenantId: string): Promise<WalletTransaction[]>;
  async getTransactions(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{ data: WalletTransaction[]; total: number }>;
  async getTransactions(
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<any> {
    const wallet = await this.getOrCreateWallet(tenantId);

    if (page !== undefined || limit !== undefined) {
      const p = page || 1;
      const l = limit || 20;
      const [data, total] = await this.transactionRepository.findAndCount({
        where: { tenantId, walletId: wallet.id },
        order: { createdAt: 'DESC' },
        skip: (p - 1) * l,
        take: l,
      });
      return { data, total };
    }

    return this.transactionRepository.find({
      where: { tenantId, walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async credit(
    tenantId: string,
    amount: number,
    source: string,
    description?: string,
    referenceId?: string,
  ): Promise<WalletTransaction> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.walletRepository.manager.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const txRepo = manager.getRepository(WalletTransaction);

      let wallet = await walletRepo.findOne({ where: { tenantId } });
      if (!wallet) {
        wallet = await walletRepo.save(
          walletRepo.create({ tenantId, balance: 0, currency: 'USD' }),
        );
      }

      const newBalance = Number(wallet.balance) + amount;
      wallet.balance = newBalance;
      wallet.totalCredited = Number(wallet.totalCredited || 0) + amount;
      await walletRepo.save(wallet);

      const tx = txRepo.create({
        tenantId,
        walletId: wallet.id,
        type: WalletTransactionType.CREDIT,
        amount,
        balanceAfter: newBalance,
        source,
        description: description ?? 'Credit added',
        referenceId,
      });
      return txRepo.save(tx);
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
      wallet.totalCredited = Number(wallet.totalCredited || 0) + dto.amount;
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
          source: 'ADD_CREDITS',
        }),
      );

      return saved;
    });
  }

  async debit(
    tenantId: string,
    amount: number,
    descriptionOrSource: string,
    description?: string,
    referenceId?: string,
  ): Promise<Wallet> {
    const desc = description ?? descriptionOrSource;
    const src = description ? descriptionOrSource : undefined;

    if (amount <= 0) throw new BadRequestException('Amount must be positive');

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
      wallet.totalDebited = Number(wallet.totalDebited || 0) + amount;
      const saved = await walletRepo.save(wallet);

      await txRepo.save(
        txRepo.create({
          tenantId,
          walletId: wallet.id,
          type: WalletTransactionType.DEBIT,
          amount,
          balanceAfter: newBalance,
          description: desc,
          referenceId,
          source: src,
        }),
      );

      return saved;
    });
  }
}
