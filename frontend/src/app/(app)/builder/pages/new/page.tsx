'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { flowService } from '@/services/flow.service';

export default function NewBuilderPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await flowService.create({ name, description, type: 'voice', definition: { nodes: [], edges: [] }, isPublished: false });
      toast.success('Page flow created');
      router.push(`/builder/pages/${res.data.data.id}/edit`);
    } catch {
      toast.error('Create failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/builder/pages" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pages</Link>
      <h1 className="text-2xl font-bold">New Builder Page</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div><label className="text-sm font-medium">Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required /></div>
        <div><label className="text-sm font-medium">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Save className="h-4 w-4" /> Create</button>
      </form>
    </div>
  );
}
