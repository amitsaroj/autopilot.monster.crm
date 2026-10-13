jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));
import { RbacService } from './rbac.service';

describe('tenant RBAC privilege boundaries', () => {
  const repo = {
    findRoleWithPermissions: jest.fn(),
    create: jest.fn(),
    updateWithTenant: jest.fn(),
    delete: jest.fn(),
    assignRole: jest.fn(),
  };
  const service = new RbacService(repo as any, { emit: jest.fn() } as any);
  beforeEach(() => jest.clearAllMocks());

  it('cannot create a platform administrator role', async () => {
    await expect(
      service.createRole('tenant', { name: 'SUPER_ADMIN', permissionIds: [] }),
    ).rejects.toThrow();
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('cannot rename a custom role into a platform role', async () => {
    repo.findRoleWithPermissions.mockResolvedValue({ name: 'Sales' });
    await expect(service.updateRole('tenant', 'role', { name: 'SUPER_ADMIN' })).rejects.toThrow();
    expect(repo.updateWithTenant).not.toHaveBeenCalled();
  });
  it('cannot delete a system role', async () => {
    repo.findRoleWithPermissions.mockResolvedValue({ name: 'ADMIN', isSystem: true });
    await expect(service.removeRole('tenant', 'role')).rejects.toThrow();
    expect(repo.delete).not.toHaveBeenCalled();
  });
  it('cannot assign a platform role through tenant role management', async () => {
    repo.findRoleWithPermissions.mockResolvedValue({ name: 'SUPER_ADMIN' });
    await expect(service.assignRole('tenant', 'user', 'role')).rejects.toThrow();
    expect(repo.assignRole).not.toHaveBeenCalled();
  });
});
