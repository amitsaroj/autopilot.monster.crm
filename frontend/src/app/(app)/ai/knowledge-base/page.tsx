'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, FileText, Database, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { knowledgeBaseService, KnowledgeBase } from '@/services/knowledge-base.service';

export default function KnowledgeBasePage() {
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await knowledgeBaseService.list();
      setBases(res.data);
      if (res.data.length > 0 && !selectedKbId) {
        setSelectedKbId(res.data[0].id);
      }
    } catch {
      toast.error('Failed to load knowledge bases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const ensureKb = async (): Promise<string> => {
    if (selectedKbId) return selectedKbId;
    const res = await knowledgeBaseService.create({ name: 'Default Knowledge Base' });
    const created = (res as { data: { data: KnowledgeBase } }).data?.data;
    if (!created?.id) throw new Error('Failed to create knowledge base');
    setSelectedKbId(created.id);
    return created.id;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const kbId = await ensureKb();
      await knowledgeBaseService.uploadDocument(kbId, file);
      toast.success('Document indexed');
      void load();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const documents = bases.flatMap((kb) =>
    (kb.indexMeta?.documents ?? []).map((doc) => ({
      ...doc,
      kbName: kb.name,
      kbStatus: kb.status,
    })),
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI OS</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vector Data Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload documents to power your RAG engine and AI copilot agents.</p>
        </div>
        <Link href="/ai/knowledge-base/upload" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
          <Database className="w-4 h-4" /> Quick Upload
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Upload Documents</h2>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 p-8 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-primary mb-4" />
                )}
                <h3 className="font-semibold text-foreground">Drop or browse files</h3>
                <p className="text-xs text-muted-foreground mt-2">PDF, DOCX, TXT supported</p>
              </button>
              {bases.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-muted-foreground">Target knowledge base</label>
                  <select
                    value={selectedKbId ?? ''}
                    onChange={(e) => setSelectedKbId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    {bases.map((kb) => (
                      <option key={kb.id} value={kb.id}>{kb.name} ({kb.status})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground mb-4">Indexed Knowledge</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {documents.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No documents indexed yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">Filename</th>
                      <th className="px-5 py-3.5 font-medium">Chunks</th>
                      <th className="px-5 py-3.5 font-medium">Status</th>
                      <th className="px-5 py-3.5 font-medium">Indexed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30">
                        <td className="px-5 py-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {doc.fileName}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs">{doc.chunksIndexed ?? 0}</td>
                        <td className="px-5 py-4">{doc.kbStatus}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {doc.indexedAt ? new Date(doc.indexedAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
