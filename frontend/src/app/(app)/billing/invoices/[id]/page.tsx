'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { billingService, Invoice } from '@/services/billing.service';

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await billingService.getInvoice(id);
        setInvoice(res.data.data);
      } catch {
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!invoice) {
    return <p className="py-8 text-center text-muted-foreground">Invoice not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/billing/invoices" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Invoices
      </Link>
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">Invoice {invoice.number}</h1>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted-foreground">Status</dt><dd className="font-medium">{invoice.status}</dd></div>
          <div><dt className="text-muted-foreground">Amount</dt><dd className="font-medium">{invoice.currency} {Number(invoice.total).toFixed(2)}</dd></div>
          <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</dd></div>
          {invoice.dueDate && <div><dt className="text-muted-foreground">Due</dt><dd className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</dd></div>}
          {invoice.paidAt && <div><dt className="text-muted-foreground">Paid</dt><dd className="font-medium">{new Date(invoice.paidAt).toLocaleDateString()}</dd></div>}
        </dl>
      </div>
    </div>
  );
}
