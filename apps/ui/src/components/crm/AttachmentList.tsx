'use client';

import { useState } from 'react';
import { 
  Paperclip, 
  Trash2, 
  Download, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUploading?: boolean;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function AttachmentList({ 
  attachments, 
  onUpload, 
  onDelete, 
  isUploading = false 
}: AttachmentListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await onUpload(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    setIsDeleting(id);
    try {
      await onDelete(id);
      toast.success('Attachment deleted');
    } catch (error) {
      toast.error('Failed to delete attachment');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Paperclip className="w-4 h-4" /> Documents & Attachments
        </h3>
        <label className="p-2 cursor-pointer bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition">
          <Plus className="w-4 h-4" />
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isUploading && (
          <div className="p-4 bg-gray-50/50 dark:bg-card/50 rounded-2xl border border-gray-100 dark:border-border flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        )}

        {attachments.length === 0 && !isUploading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-border rounded-3xl opacity-40">
            <Paperclip className="w-8 h-8 mb-2 text-gray-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">No attachments yet</span>
          </div>
        ) : (
          attachments.map(file => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div key={file.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-card/50 rounded-2xl border border-gray-100 dark:border-border hover:border-emerald-100 dark:hover:border-emerald-900/50 shadow-soft transition">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition">
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-indigo-500 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    disabled={isDeleting === file.id}
                    className="p-2 text-gray-300 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {isDeleting === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
