import 'dotenv/config';

process.env.JWT_SECRET ??= 'test-jwt-secret-min-32-characters-long';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-min-32-chars-long';
process.env.JWT_ALGORITHM ??= 'HS256';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_e2e_placeholder_key_000000000000';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_test_e2e_placeholder_secret';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(),
  generateURI: jest.fn(),
  verifySync: jest.fn(),
}));
