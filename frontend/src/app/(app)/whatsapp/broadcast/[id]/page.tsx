import { BroadcastDetail } from '@/components/whatsapp/BroadcastDetail';
export default async function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BroadcastDetail id={id} />;
}
