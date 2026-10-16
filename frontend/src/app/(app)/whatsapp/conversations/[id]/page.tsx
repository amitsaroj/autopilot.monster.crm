import { Inbox } from '@/components/whatsapp/Inbox';
export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phoneNumberId?: string }>;
}) {
  const { id } = await params;
  const { phoneNumberId } = await searchParams;
  return <Inbox initialPhone={id} initialPhoneNumberId={phoneNumberId} />;
}
