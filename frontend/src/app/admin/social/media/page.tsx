'use client';

import { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Search,
  Trash2,
  Download,
  Filter,
  Eye,
  Video,
  FileText,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { storageFileService, type StorageFile } from '@/services/storage-file.service';

const TYPE_ICONS: Record<string, React.ElementType> = { IMAGE: Image, VIDEO: Video, DOC: FileText };

function assetType(mime: string): string {
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.startsWith('video/')) return 'VIDEO';
  return 'DOC';
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AdminSocialMediaPage() {
  const [assets, setAssets] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await storageFileService.list();
        const files = res.data?.data ?? [];
        setAssets(
          files.filter((f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')),
        );
      } catch {
        toast.error('Failed to load media assets');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = assets.filter((a) => a.filename.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Media Library</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Social Media Asset Management
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((asset) => {
          const type = assetType(asset.mimeType);
          const Icon = TYPE_ICONS[type] ?? FileText;
          return (
            <div
              key={asset.id}
              className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Icon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{asset.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(asset.size)} · {type}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground uppercase tracking-wide hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" /> View
                </button>
                <button className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
