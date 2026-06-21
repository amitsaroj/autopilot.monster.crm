'use client';

import { use, useEffect, useState } from 'react';
import { DealSubpage } from '@/components/crm/deal-subpage';
import { storageFileService, StorageFile } from '@/services/storage-file.service';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function FilesList() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void storageFileService.list().then((r) => setFiles(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;
  if (files.length === 0) return <p className="text-sm text-muted-foreground">No files uploaded yet.</p>;

  return (
    <ul className="divide-y rounded-xl border border-border bg-card">
      {files.map((f) => (
        <li key={f.id}><Link href={`/storage/${f.id}`} className="block p-4 hover:bg-muted/50">{f.filename}</Link></li>
      ))}
    </ul>
  );
}

export default function DealFilesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <DealSubpage params={params} title="Files">
      {() => <FilesList />}
    </DealSubpage>
  );
}
