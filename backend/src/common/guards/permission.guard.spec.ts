import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionGuard } from './permission.guard';
import { METADATA_KEYS } from '../constants/app.constants';

describe('PermissionGuard', () => {
  let reflector: Reflector;
  let guard: PermissionGuard;

  function mockReflector(values: Record<string, unknown>): void {
    reflector = {
      getAllAndOverride: jest.fn((key: string) => values[key]),
    } as unknown as Reflector;
    guard = new PermissionGuard(reflector);
  }

  function createContext(method: string, user?: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          user,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows public routes without permission metadata', () => {
    mockReflector({ [METADATA_KEYS.IS_PUBLIC]: true });

    expect(guard.canActivate(createContext('GET'))).toBe(true);
  });

  it('allows super admin without permission metadata', () => {
    mockReflector({ [METADATA_KEYS.IS_PUBLIC]: false });

    expect(
      guard.canActivate(
        createContext('GET', {
          roles: ['SUPER_ADMIN'],
          permissions: [],
        }),
      ),
    ).toBe(true);
  });

  it('denies authenticated users when no permission metadata is present', () => {
    mockReflector({ [METADATA_KEYS.IS_PUBLIC]: false });

    expect(() =>
      guard.canActivate(
        createContext('GET', {
          roles: ['USER'],
          permissions: [],
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows routes marked with skip permission check', () => {
    mockReflector({
      [METADATA_KEYS.IS_PUBLIC]: false,
      [METADATA_KEYS.SKIP_PERMISSION_CHECK]: true,
    });

    expect(
      guard.canActivate(
        createContext('GET', {
          roles: ['USER'],
          permissions: [],
        }),
      ),
    ).toBe(true);
  });

  it('derives permissions from resource decorator and method', () => {
    mockReflector({
      [METADATA_KEYS.IS_PUBLIC]: false,
      [METADATA_KEYS.PERMISSIONS]: undefined,
      [METADATA_KEYS.PERMISSION_RESOURCE]: 'contacts',
    });

    expect(
      guard.canActivate(
        createContext('POST', {
          roles: ['USER'],
          permissions: ['contacts:create'],
        }),
      ),
    ).toBe(true);

    expect(() =>
      guard.canActivate(
        createContext('DELETE', {
          roles: ['USER'],
          permissions: ['contacts:read'],
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
