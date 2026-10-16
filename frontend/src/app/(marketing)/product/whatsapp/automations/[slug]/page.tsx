import AutomationDetail from '@/components/whatsapp/AutomationDetail';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
      <AutomationDetail key={slug} slug={slug} publicView />
    </div>
  );
}
