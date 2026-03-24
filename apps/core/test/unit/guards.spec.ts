import { TenantGuard } from '../../src/common/guards/tenant.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { PlanGuard } from '../../src/common/guards/plan.guard';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

function makeContext(
  user: Partial<{ tenantId: string; roles: string[]; planId: string }>,
  headerTenantId?: string,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        headers: { 'x-tenant-id': headerTenantId },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

// ─── TenantGuard ─────────────────────────────────────────────────────────────
describe('TenantGuard', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  it('should pass when tenantId present in JWT', () => {
    const ctx = makeContext({ tenantId: 'tenant-abc' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException when tenantId is missing', () => {
    const ctx = makeContext({ tenantId: '' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when header tenantId does not match JWT', () => {
    const ctx = makeContext({ tenantId: 'tenant-abc' }, 'tenant-XYZ');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should pass when header tenantId matches JWT', () => {
    const ctx = makeContext({ tenantId: 'tenant-abc' }, 'tenant-abc');
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

// ─── RolesGuard ──────────────────────────────────────────────────────────────
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('should pass when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext({ roles: [] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should pass when user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = makeContext({ roles: ['admin', 'user'] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = makeContext({ roles: ['user'] });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

// ─── PlanGuard ───────────────────────────────────────────────────────────────
describe('PlanGuard', () => {
  let guard: PlanGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new PlanGuard(reflector);
  });

  it('should pass when no feature required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext({ planId: '' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when planId is missing (no subscription)', () => {
    reflector.getAllAndOverride.mockReturnValue('whatsapp');
    const ctx = makeContext({ planId: '' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should pass when planId is present', () => {
    reflector.getAllAndOverride.mockReturnValue('whatsapp');
    const ctx = makeContext({ planId: 'plan-pro' });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
