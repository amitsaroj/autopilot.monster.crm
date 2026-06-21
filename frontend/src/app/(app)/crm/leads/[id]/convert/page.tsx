'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { leadService } from '@/services/lead.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function ConvertLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await leadService.convertLead(id);
      const result = parseApiData<{ contactId?: string }>(res);
      toast.success('Lead converted to contact');
      router.push(result?.contactId ? `/crm/contacts/${result.contactId}` : '/crm/contacts');
    } catch {
      toast.error('Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg animate-fade-in">
      <Link href={`/crm/leads/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Lead
      </Link>
      <h1 className="page-title">Convert Lead</h1>
      <p className="text-sm text-muted-foreground">Convert this lead into a CRM contact and optionally create a deal.</p>
      <button
        onClick={() => void handleConvert()}
        disabled={converting}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
      >
        <UserCheck className="h-4 w-4" /> {converting ? 'Converting...' : 'Convert to Contact'}
      </button>
    </div>
  );
}
