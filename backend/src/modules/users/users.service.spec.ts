jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));
import { UsersService } from './users.service';

describe('invitation role boundaries', () => {
  const repo = {
    findInvitationRole: jest.fn(),
    findActorRoles: jest.fn(),
    createInvitation: jest.fn(),
    findByEmail: jest.fn(),
  };
  const service = new UsersService(repo as any, {} as any, { emit: jest.fn() } as any);
  const dto = { email: 'invite@example.test', roleId: 'role' };
  beforeEach(() => {
    jest.clearAllMocks();
    repo.findActorRoles.mockResolvedValue(['ADMIN']);
  });
  it('rejects roles from another tenant', async () => {
    repo.findInvitationRole.mockResolvedValue(null);
    await expect(service.inviteUser('tenant', 'actor', dto)).rejects.toThrow('Role not found');
    expect(repo.createInvitation).not.toHaveBeenCalled();
  });
  it.each(['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN'])(
    'prevents a delegated admin inviting %s',
    async (name) => {
      repo.findInvitationRole.mockResolvedValue({ name });
      await expect(service.inviteUser('tenant', 'actor', dto)).rejects.toThrow('Cannot invite');
      expect(repo.createInvitation).not.toHaveBeenCalled();
    },
  );
  it('allows a delegated admin to invite an agent', async () => {
    repo.findInvitationRole.mockResolvedValue({ name: 'AGENT' });
    repo.findByEmail.mockResolvedValue(null);
    repo.createInvitation.mockResolvedValue({ id: 'invitation' });
    await service.inviteUser('tenant', 'actor', dto);
    expect(repo.createInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant', roleId: 'role' }),
    );
  });
});
