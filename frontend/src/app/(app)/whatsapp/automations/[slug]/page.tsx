import AutomationDetail from '@/components/whatsapp/AutomationDetail';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AutomationDetail key={slug} slug={slug} />;
}
