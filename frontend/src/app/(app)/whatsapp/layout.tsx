import { WhatsAppNav } from '@/components/whatsapp/ui';
export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <WhatsAppNav />
      {children}
    </div>
  );
}
