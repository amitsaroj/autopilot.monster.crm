'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageFileService, StorageFile } from '@/services/storage-file.service';

export default function StorageFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [file, setFile] = useState<StorageFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void storageFileService.get(id).then((r) => setFile(r.data.data)).catch(() => toast.error('File not found')).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await storageFileService.getDownloadUrl(id);
      window.open(res.data.data.downloadUrl, '_blank');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this file?')) return;
    try {
      await storageFileService.remove(id);
      toast.success('File deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!file) return <p className="py-8 text-center text-muted-foreground">File not found</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/storage" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Storage</Link>
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold">{file.filename}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{file.mimeType} · {(file.size / 1024).toFixed(1)} KB</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => void handleDownload()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Download className="h-4 w-4" /> Download</button>
          <button type="button" onClick={() => void handleDelete()} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>
    </div>
  );
}
