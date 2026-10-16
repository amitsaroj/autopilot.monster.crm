import { BroadcastDetail } from '@/components/whatsapp/BroadcastDetail';
import { BroadcastApprovalControls } from './approval-controls';
export default async function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <BroadcastApprovalControls id={id} />
      <BroadcastDetail id={id} />
    </div>
  );
}
