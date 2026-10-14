import { TemplateEditor } from '@/components/whatsapp/TemplateEditor';
export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TemplateEditor id={id} />;
}
