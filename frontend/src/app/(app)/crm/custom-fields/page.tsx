'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Loader2,
  Database,
  Layers,
  Hash,
  Type,
  Calendar,
  CheckSquare,
  List,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: string;
  entityType: string;
  isRequired: boolean;
  order: number;
}

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'TEXT',
    entityType: 'LEAD',
    isRequired: false,
    order: 0,
  });

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/custom-fields');
      if (res.data?.data) {
        setFields(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to synchronize schema lattice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/custom-fields', formData);
      toast.success('Schema node initialized');
      setIsModalOpen(false);
      fetchFields();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Configuration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm dissolution of schema node?')) return;
    try {
      await api.delete(`/crm/custom-fields/${id}`);
      toast.success('Node dissolved from lattice');
      fetchFields();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Dissolution failed');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return <Type className="w-4 h-4" />;
      case 'NUMBER':
        return <Hash className="w-4 h-4" />;
      case 'DATE':
        return <Calendar className="w-4 h-4" />;
      case 'BOOLEAN':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <List className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Schema Orchestration Active
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Lattice Orchestrator
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage dynamic schema extensions and entity properties
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4" /> Initialize Schema Node
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fields.map((field) => (
            <div
              key={field.id}
              className="p-8 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-[20px] bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all shadow-2xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="p-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-2 leading-none uppercase tracking-tight mb-2">
                  {field.label}
                </h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
                    {field.entityType} TARGET
                  </span>
                  {field.isRequired && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wide border border-red-500/20">
                      REQUIRED
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    <Database className="w-4 h-4 opacity-40 shrink-0" /> Field: {field.name}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    <div className="opacity-40 shrink-0">{getTypeIcon(field.type)}</div> Type:{' '}
                    {field.type}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">
                No custom schema nodes detected in the lattice.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-500" /> Initialize Schema Node
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    UI Label
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40"
                    placeholder="e.g. VAT Number"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Internal Property Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toLowerCase().replace(/ /g, '_'),
                      })
                    }
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 font-mono text-xs"
                    placeholder="vat_number"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Data Vector Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                  >
                    <option value="TEXT" className="bg-card">
                      TEXT (String)
                    </option>
                    <option value="NUMBER" className="bg-card">
                      NUMBER (Integer/Float)
                    </option>
                    <option value="DATE" className="bg-card">
                      DATE (ISO-8601)
                    </option>
                    <option value="BOOLEAN" className="bg-card">
                      BOOLEAN (True/False)
                    </option>
                  </select>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Entity Target Lattice
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                  >
                    <option value="LEAD" className="bg-card">
                      Acquisition Vector (Lead)
                    </option>
                    <option value="CONTACT" className="bg-card">
                      Human Entity (Contact)
                    </option>
                    <option value="COMPANY" className="bg-card">
                      Organizational Entity (Company)
                    </option>
                    <option value="DEAL" className="bg-card">
                      Revenue Path (Deal)
                    </option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="w-4 h-4 rounded bg-card border-border text-blue-500 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="isRequired"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer"
                  >
                    Enforce Data Presence (Required)
                  </label>
                </div>
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
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20"
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
