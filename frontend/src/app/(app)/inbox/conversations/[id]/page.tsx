import { Inbox } from '@/components/whatsapp/Inbox';

export default async function InboxConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phoneNumberId?: string }>;
}) {
  const { id: phone } = await params;
  const { phoneNumberId } = await searchParams;
  return <Inbox initialPhone={decodeURIComponent(phone)} initialPhoneNumberId={phoneNumberId} />;
}
