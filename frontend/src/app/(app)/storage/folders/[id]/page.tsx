'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { storageFileService, StorageFile } from '@/services/storage-file.service';

export default function StorageFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void storageFileService.list().then((r) => {
      const all = r.data.data ?? [];
      setFiles(all.filter((f) => f.fileKey.startsWith(`${id}/`) || f.fileKey.includes(id)));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link href="/storage" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Storage</Link>
      <h1 className="text-2xl font-bold">Folder: {id}</h1>
      <ul className="divide-y rounded-xl border border-border bg-card">
        {files.length === 0 && <li className="p-4 text-sm text-muted-foreground">No files in this folder.</li>}
        {files.map((f) => (
          <li key={f.id}><Link href={`/storage/${f.id}`} className="block p-4 hover:bg-muted/50">{f.filename}</Link></li>
        ))}
      </ul>
    </div>
  );
}
