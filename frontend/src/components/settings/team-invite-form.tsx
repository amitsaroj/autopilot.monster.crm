'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
import { rbacService, type Role } from '@/services/rbac.service';

export function TeamInviteForm({ destination = '/settings/users' }: { destination?: string }) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invites, setInvites] = useState([{ id: 'first', email: '', roleId: '' }]);
  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await rbacService.getRoles();
      setRoles(parseApiData<Role[]>(response) ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const results = await Promise.allSettled(
      invites.map(({ email, roleId }) =>
        api.post('/users/invite', { email: email.trim(), roleId }),
      ),
    );
    const failed = invites.filter((_, index) => results[index].status === 'rejected');
    if (failed.length) {
      setInvites(failed);
      toast.error(
        `${failed.length} invitation${failed.length === 1 ? '' : 's'} could not be sent. Check your access and try again.`,
      );
    } else {
      toast.success('Invitations sent');
      router.push(destination);
    }
    setSaving(false);
  };
  return (
    <form onSubmit={submit} className="product-panel p-5 sm:p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="font-semibold">Invite your team</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Choose a workspace role for each person. Invitations use your existing access controls.
        </p>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading available roles…
        </p>
      ) : error ? (
        <div role="alert">
          <p className="text-sm mb-3">Available roles could not be loaded.</p>
          <button
            type="button"
            onClick={() => void loadRoles()}
            className="product-button product-button-secondary"
          >
            Retry
          </button>
        </div>
      ) : roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No roles are available for invitations. Check workspace permissions.
        </p>
      ) : (
        <>
          {invites.map((invite, index) => (
            <div key={invite.id} className="grid sm:grid-cols-[1fr_180px_40px] items-end gap-3">
              <div>
                <label
                  htmlFor={`invite-email-${invite.id}`}
                  className="text-xs font-medium block mb-2"
                >
                  Email address
                </label>
                <input
                  id={`invite-email-${invite.id}`}
                  type="email"
                  required
                  disabled={saving}
                  value={invite.email}
                  placeholder="colleague@company.com"
                  onChange={(event) =>
                    setInvites((current) =>
                      current.map((item) =>
                        item.id === invite.id ? { ...item, email: event.target.value } : item,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor={`invite-role-${invite.id}`}
                  className="text-xs font-medium block mb-2"
                >
                  Workspace role
                </label>
                <select
                  id={`invite-role-${invite.id}`}
                  required
                  disabled={saving}
                  value={invite.roleId}
                  onChange={(event) =>
                    setInvites((current) =>
                      current.map((item) =>
                        item.id === invite.id ? { ...item, roleId: event.target.value } : item,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm"
                >
                  <option value="">Choose a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                aria-label={`Remove invitation ${index + 1}`}
                disabled={saving || invites.length === 1}
                onClick={() =>
                  setInvites((current) => current.filter((item) => item.id !== invite.id))
                }
                className="p-3 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              setInvites((current) => [
                ...current,
                { id: crypto.randomUUID(), email: '', roleId: '' },
              ])
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            <Plus className="w-4 h-4" />
            Add another person
          </button>
        </>
      )}
      <div className="border-t border-border pt-5">
        <button
          disabled={saving || loading || error || !roles.length}
          className="product-button product-button-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Send
          invitations
        </button>
      </div>
    </form>
  );
}
