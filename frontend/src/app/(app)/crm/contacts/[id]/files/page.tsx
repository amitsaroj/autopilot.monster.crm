'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { storageFileService, type StorageFile } from '@/services/storage-file.service';

import { ContactSubpage } from '@/components/crm/contact-subpage';

export default function ContactFilesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ContactSubpage params={params} title="Files">
      {() => <FilesList />}
    </ContactSubpage>
  );
}

function FilesList() {
  const [items, setItems] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await storageFileService.list();
        setItems(res.data?.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">No files uploaded.</p>;

  return (
    <div className="space-y-3">
      {items.map((file) => (
        <div
          key={file.id}
          className="rounded-xl border border-border bg-card p-4 flex justify-between"
        >
          <div>
            <p className="font-medium">{file.filename}</p>
            <p className="text-sm text-muted-foreground">{file.mimeType}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(file.createdAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
