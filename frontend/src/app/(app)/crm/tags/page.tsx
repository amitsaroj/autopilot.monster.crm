'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Loader2, Tag as TagIcon, Hash, Palette } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';

interface Tag {
  id: string;
  name: string;
  color: string;
  type: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#155eef',
    type: 'GENERIC',
  });

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/tags');
      if (res.data?.data) {
        setTags(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to synchronize taxonomy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/tags', formData);
      toast.success('Taxonomy node initialized');
      setIsModalOpen(false);
      fetchTags();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Configuration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm dissolution of taxonomy node?')) return;
    try {
      await api.delete(`/crm/tags/${id}`);
      toast.success('Node dissolved');
      fetchTags();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Dissolution failed');
    }
  };

  const colors = [
    '#155eef',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#0089a8',
    '#ec4899',
    '#06b6d4',
    '#168bff',
    '#f43f5e',
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Taxonomy Layer Active
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Tag Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage entity classification nodes and visual markers
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4" /> Initialize Node
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group relative overflow-hidden backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: `${tag.color}10`,
                    border: `1px solid ${tag.color}30`,
                    color: tag.color,
                  }}
                >
                  <TagIcon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">
                {tag.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                  Identity: {tag.id.slice(0, 8)}
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-card text-muted-foreground uppercase tracking-tighter">
                  {tag.type}
                </span>
              </div>
              <div
                className="absolute bottom-0 left-0 w-full h-1"
                style={{ backgroundColor: tag.color }}
              />
            </div>
          ))}
          {tags.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">
                No taxonomy nodes detected.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
              <TagIcon className="w-6 h-6 text-blue-500" /> Initialize Node
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Node Designation
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl pl-12 pr-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 uppercase tracking-wide"
                    placeholder="e.g. VIP-CLIENT"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Chromatic Marker
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-10 h-10 rounded-xl transition-all border-2 ${formData.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                  Logical Scope
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                >
                  <option value="GENERIC" className="bg-card">
                    Omni-Dimensional (Generic)
                  </option>
                  <option value="LEAD" className="bg-card">
                    Acquisition Vector (Lead)
                  </option>
                  <option value="CONTACT" className="bg-card">
                    Human Entity (Contact)
                  </option>
                  <option value="DEAL" className="bg-card">
                    Revenue Pipeline (Deal)
                  </option>
                </select>
              </div>

              <div className="pt-6 border-t border-border flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-card border-border border hover:bg-white/[0.05] text-foreground rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
