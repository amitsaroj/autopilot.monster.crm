'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  whatsappBroadcastService,
  type WhatsappBroadcast,
} from '@/services/whatsapp-broadcast.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  buttonClass,
  Field,
  inputClass,
  Notice,
  panelClass,
  secondaryClass,
} from '@/components/whatsapp/ui';
import { errorMessage } from '@/components/whatsapp/ui';

export function BroadcastApprovalControls({ id }: { id: string }) {
  const user = useAuth((state) => state.user as { id?: string; roles?: string[] } | null);
  const canReview = !!user?.roles?.includes('TENANT_ADMIN');
  const broadcast = useResource(
    async () => parseApiData<WhatsappBroadcast>(await whatsappBroadcastService.get(id)),
    10000,
  );
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const b = broadcast.data;

  async function run(action: 'request' | 'approve' | 'reject') {
    setBusy(true);
    setError(null);
    try {
      if (action === 'request') await whatsappBroadcastService.requestApproval(id);
      else
        await whatsappBroadcastService.reviewApproval(
          id,
          action === 'approve' ? 'APPROVED' : 'REJECTED',
          note.trim() || undefined,
        );
      setNote('');
      setNotice(
        action === 'request'
          ? 'Broadcast submitted for owner/admin review.'
          : `Broadcast ${action === 'approve' ? 'approved' : 'rejected'}.`,
      );
      await broadcast.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (!b) return null;
  return (
    <section className={`${panelClass} space-y-3`} aria-label="Campaign approval">
      <h2 className="font-semibold">
        Campaign approval · {b.approvalRequired ? b.approvalStatus : 'OPTIONAL'}
      </h2>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {b.approvalNote && (
        <p className="text-sm text-muted-foreground">Reviewer note: {b.approvalNote}</p>
      )}
      {b.approvalRequired && b.approvalStatus === 'PENDING' && (
        <Notice>
          Sending and scheduling are blocked until a different tenant administrator approves this campaign.
        </Notice>
      )}
      {b.approvalStatus === 'REJECTED' && (
        <Notice error>
          This campaign was rejected. Review the note before resubmitting; duplicate it to configure
          a revised campaign.
        </Notice>
      )}
      {b.status === 'DRAFT' && (!b.approvalRequired || b.approvalStatus === 'REJECTED') && (
        <button className={secondaryClass} disabled={busy} onClick={() => void run('request')}>
          {b.approvalStatus === 'REJECTED' ? 'Resubmit for approval' : 'Submit for approval'}
        </button>
      )}
      {canReview && b.approvalStatus === 'PENDING' && b.approvalRequestedBy !== user?.id && (
        <>
          <Field label="Reviewer note (optional)">
            <textarea
              className={inputClass}
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button className={buttonClass} disabled={busy} onClick={() => void run('approve')}>
              Approve campaign
            </button>
            <button className={secondaryClass} disabled={busy} onClick={() => void run('reject')}>
              Reject campaign
            </button>
          </div>
        </>
      )}
    </section>
  );
}
