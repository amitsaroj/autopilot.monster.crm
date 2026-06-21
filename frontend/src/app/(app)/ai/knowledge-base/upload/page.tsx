'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { knowledgeBaseService } from '@/services/knowledge-base.service';

export default function KnowledgeBaseUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [kbId, setKbId] = useState<string | null>(null);

  useEffect(() => {
    void knowledgeBaseService.list().then((res) => {
      if (res.data[0]) setKbId(res.data[0].id);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let targetId = kbId;
      if (!targetId) {
        const created = await knowledgeBaseService.create({ name: 'Default Knowledge Base' });
        targetId = (created as { data: { data: { id: string } } }).data?.data?.id ?? null;
      }
      if (targetId) {
        await knowledgeBaseService.uploadDocument(targetId, file);
      } else {
        await knowledgeBaseService.uploadLegacy(file);
      }
      toast.success('Document indexed');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="text-2xl font-bold">Upload to Knowledge Base</h1>
      <input type="file" onChange={(e) => void handleUpload(e)} disabled={uploading} className="block w-full text-sm" />
      {uploading && <p className="text-sm text-muted-foreground">Indexing document...</p>}
    </div>
  );
}
