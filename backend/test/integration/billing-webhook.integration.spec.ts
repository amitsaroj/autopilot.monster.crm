import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingService } from '../../src/modules/billing/billing.service';
import { Subscription } from '../../src/database/entities/subscription.entity';
import { Invoice } from '../../src/database/entities/invoice.entity';
import { Payment } from '../../src/database/entities/payment.entity';
import { UsageRecord } from '../../src/database/entities/usage-record.entity';
import { Plan } from '../../src/database/entities/plan.entity';
import { PaymentMethod } from '../../src/database/entities/payment-method.entity';

const constructEventMock = jest.fn(() => {
  throw new Error('invalid signature');
});

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: constructEventMock },
    customers: { create: jest.fn() },
    checkout: { sessions: { create: jest.fn() } },
    billingPortal: { sessions: { create: jest.fn() } },
    subscriptions: { retrieve: jest.fn(), update: jest.fn(), cancel: jest.fn() },
    setupIntents: { create: jest.fn() },
    paymentMethods: { attach: jest.fn(), retrieve: jest.fn(), detach: jest.fn() },
  }));
});

describe('BillingService webhook', () => {
  let service: BillingService;

  const mockSubscriptionRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockInvoiceRepo = { save: jest.fn(), find: jest.fn() };
  const mockPaymentRepo = { save: jest.fn(), find: jest.fn() };
  const mockUsageRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockPlanRepo = { findOne: jest.fn() };
  const mockPaymentMethodRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'app.stripe') {
                return { secretKey: 'sk_test_mock', webhookSecret: 'whsec_test' };
              }
              if (key === 'app.stripe.webhookSecret') {
                return 'whsec_test';
              }
              if (key === 'app.frontendUrl') {
                return 'http://localhost:3000';
              }
              return undefined;
            },
          },
        },
        { provide: getRepositoryToken(Subscription), useValue: mockSubscriptionRepo },
        { provide: getRepositoryToken(Invoice), useValue: mockInvoiceRepo },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: getRepositoryToken(UsageRecord), useValue: mockUsageRepo },
        { provide: getRepositoryToken(Plan), useValue: mockPlanRepo },
        { provide: getRepositoryToken(PaymentMethod), useValue: mockPaymentMethodRepo },
      ],
    }).compile();

    service = module.get(BillingService);
  });

  it('rejects webhook without valid signature', async () => {
    await expect(service.handleWebhook('sig', Buffer.from('{}'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(constructEventMock).toHaveBeenCalled();
  });
});
