'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, Product } from '@/services/product.service';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void productService.getProduct(id).then((r) => setForm((r as { data: { data: Product } }).data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/crm/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <form onSubmit={(e) => { e.preventDefault(); void productService.updateProduct(id, form).then(() => toast.success('Saved')).catch(() => toast.error('Failed')); }} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Name</label><input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <div><label className="text-sm font-medium">Price</label><input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Save</button>
      </form>
    </div>
  );
}
