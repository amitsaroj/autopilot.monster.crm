'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

import { whatsappTemplateService, WhatsappTemplate } from '@/services/whatsapp-template.service';

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await whatsappTemplateService.list();
      setTemplates(res.data.data ?? []);
    } catch {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleSync = async (id: string) => {
    await whatsappTemplateService.sync(id);
    await loadTemplates();
  };

  const handleDelete = async (id: string) => {
    await whatsappTemplateService.remove(id);
    await loadTemplates();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
            <Link href="/whatsapp" className="hover:text-foreground">
              WhatsApp
            </Link>
            <span>/</span>
            <span className="text-foreground">Templates</span>
          </div>
          <h1 className="text-2xl font-bold">Message Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Meta-approved templates for broadcasts and workflows.</p>
        </div>
        <Link
          href="/whatsapp/templates/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Template
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Language</th>
              <th className="p-4 text-left font-medium">Category</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Loading templates...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No templates yet.
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id} className="border-t">
                  <td className="p-4 font-medium">{template.name}</td>
                  <td className="p-4">{template.language}</td>
                  <td className="p-4">{template.category}</td>
                  <td className="p-4">{template.status}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleSync(template.id)}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Sync
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
