'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { flowService } from '@/services/flow.service';

export default function NewBuilderFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleCreate = async () => {
    try {
      const res = await flowService.create({ name, type: 'whatsapp', definition: { fields: [] }, isPublished: false });
      router.push(`/builder/forms/${res.data.data.id}/edit`);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8">
      <h1 className="text-2xl font-bold">New Form</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Form name" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
      <button type="button" onClick={() => void handleCreate()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Create</button>
    </div>
  );
}
