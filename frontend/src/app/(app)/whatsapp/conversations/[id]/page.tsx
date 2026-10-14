import { Inbox } from '@/components/whatsapp/Inbox';
export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Inbox initialPhone={id} />;
}
