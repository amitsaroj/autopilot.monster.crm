'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  Folder,
  File,
  Eye,
  Trash2,
  MoreVertical,
  Image,
  Archive,
  ArrowRight,
  Clock,
  User,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { storageFileService, type StorageFile } from '@/services/storage-file.service';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileType(mime: string): 'PDF' | 'DOCX' | 'IMAGE' | 'CSV' | 'OTHER' {
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('word') || mime.includes('document')) return 'DOCX';
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.includes('csv')) return 'CSV';
  return 'OTHER';
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  PDF: FileText,
  DOCX: FileText,
  IMAGE: Image,
  CSV: Archive,
  OTHER: File,
};

const TYPE_COLORS: Record<string, string> = {
  PDF: 'text-red-400 bg-red-500/10',
  DOCX: 'text-blue-700 dark:text-blue-400 bg-blue-500/10',
  IMAGE: 'text-blue-700 dark:text-blue-400 bg-blue-500/10',
  CSV: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10',
  OTHER: 'text-muted-foreground bg-gray-500/10',
};

export default function AdminCRMDocumentsPage() {
  const [docs, setDocs] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await storageFileService.list();
        setDocs(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = docs.filter((d) => d.filename.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">CRM Documents</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Workspace Document Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground uppercase tracking-wide hover:bg-white/[0.08] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search documents, contacts, deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-card">
              {['Document', 'Type', 'Linked To', 'Owner', 'Size', 'Date', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((doc) => {
              const docType = fileType(doc.mimeType);
              const Icon = TYPE_ICONS[docType] || File;
              const colorClass = TYPE_COLORS[docType] || 'text-muted-foreground bg-gray-500/10';
              return (
                <tr key={doc.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass.split(' ')[1]}`}>
                        <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground truncate max-w-[200px]">
                          {doc.filename}
                        </p>
                        <span className="text-xs text-muted-foreground font-mono">{doc.mimeType}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} border-current/20`}
                    >
                      {docType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{doc.fileKey}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      Workspace
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                    {formatSize(doc.size)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
