'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Settings,
  Trash2,
  Globe,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Activity,
  Server,
  Cpu,
  Layout,
  ExternalLink,
  Package,
  Zap,
  Download,
  Star,
  Users,
  Link as LinkIcon,
  Tags,
  FolderTree,
  Palette,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  pluginCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export default function MarketplaceCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Automation',
      slug: 'automation',
      description: 'Workflow and task automation artifacts.',
      icon: 'Zap',
      pluginCount: 124,
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'AI & Intelligence',
      slug: 'ai-intelligence',
      description: 'Neural network and LLM orchestration modules.',
      icon: 'Bot',
      pluginCount: 86,
      status: 'ACTIVE',
    },
    {
      id: '3',
      name: 'Communication',
      slug: 'communication',
      description: 'Voice, SMS, and messaging dispatch layers.',
      icon: 'MessageSquare',
      pluginCount: 52,
      status: 'ACTIVE',
    },
    {
      id: '4',
      name: 'Analytics',
      slug: 'analytics',
      description: 'Data visualization and business intelligence pulse.',
      icon: 'BarChart3',
      pluginCount: 31,
      status: 'ACTIVE',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      ARCHIVED: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Taxonomy active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Catalog: Global Hierarchy
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Marketplace Taxonomy</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Functional Groupings & Hierarchy
          </p>
        </div>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Provision Category
        </button>
      </div>

      {/* Control Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search by category artifact or slug identifier..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Filter Status
          </span>
          <select className="bg-transparent border-none outline-none text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">
            <option>All Artifacts</option>
            <option>Active only</option>
            <option>Archived</option>
          </select>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
          <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">
            Active Nodes
          </span>
          <span className="text-sm font-semibold text-foreground">12</span>
        </div>
      </div>

      {/* Category Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Taxonomy Node
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Operational Status
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Slug Artifact
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Functional Reach
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {categories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Tags className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                          {cat.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 line-clamp-1 max-w-[200px]">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(cat.status)}</td>
                  <td className="px-8 py-6 text-xs font-mono text-blue-700 dark:text-blue-400/60 uppercase tracking-tighter">
                    /{cat.slug}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        {cat.pluginCount}{' '}
                        <span className="text-xs text-muted-foreground uppercase ml-1">Artifacts</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/10 transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Taxonomy Metrics & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-8 rounded-xl bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <FolderTree className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground uppercase tracking-tighter">
              Hierarchy Pulse
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Define nested taxonomy artifacts to allow for advanced marketplace discovery.
            Synchronize parent-child relationships across all platform clusters.
          </p>
        </div>
        <div className="p-8 rounded-xl bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground uppercase tracking-tighter">
              Visual Registry
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Manage category icons, brand colors, and visual identifiers used in the tenant-facing
            marketplace dashboards.
          </p>
        </div>
        <div className="p-8 rounded-xl bg-blue-600 to-blue-600 text-white space-y-4 shadow-2xl shadow-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wide leading-tight">
                Taxonomy Sync
              </h4>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-tighter">
                Master-Node Status: Certified
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed font-medium">
            Taxonomy updates are broadcasted to all active clusters. Tenant-facing marketplaces will
            mirror these changes within seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
