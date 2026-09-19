import { assertCustomRoleName, assertMutableRole } from './role-policy';

describe('tenant role policy', () => {
  it.each(['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'AGENT', ' super_admin '])(
    'rejects reserved name %s',
    (name) => {
      expect(() => assertCustomRoleName(name)).toThrow();
    },
  );
  it('allows custom roles', () => {
    expect(() => assertCustomRoleName('Sales Manager')).not.toThrow();
    expect(() => assertMutableRole({ name: 'Sales Manager', isSystem: false })).not.toThrow();
  });
  it('protects built-in roles even without the system flag', () => {
    expect(() => assertMutableRole({ name: 'SUPER_ADMIN' })).toThrow();
    expect(() => assertMutableRole({ name: 'Owner', isSystem: true })).toThrow();
  });
});
