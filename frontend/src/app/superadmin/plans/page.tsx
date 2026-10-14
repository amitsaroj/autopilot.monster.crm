'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Globe,
  DollarSign,
  Layout,
  Layers,
  Loader2,
  ArrowRight,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  isPublic: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    name: '',
    description: '',
    priceMonthly: 0,
    priceAnnual: 0,
    currency: 'USD',
    status: 'ACTIVE',
    isPublic: true,
  });

  const handleCreatePlan = async () => {
    try {
      const res = await api.post('/monetization/admin/plans', newPlan);
      if (res.status >= 200 && res.status < 300) {
        toast.success('Plan created successfully');
        setShowCreateModal(false);
        // Refresh plans
        const listRes = await api.get('/monetization/plans');
        const json = listRes.data;
        setPlans(json.data || json);
      } else {
        toast.error('Failed to create plan');
      }
    } catch (e) {
      toast.error('Network error creating plan');
    }
  };

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api.get('/monetization/plans');
        const json = res.data;
        if (json.data || Array.isArray(json)) setPlans(json.data || json);
      } catch (e) {
        toast.error('Failed to sync pricing data');
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Monetization Registry
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Billing Architecture ({plans.length} tiers)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Define New Tier
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="group p-8 rounded-3xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Decoration */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${plan.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' : 'bg-gray-500/10 text-muted-foreground border-gray-500/20'}`}
                    >
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">ID: {plan.id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
                {plan.description ||
                  'No detailed tier description provided. Enterprise settings active.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-black/40 border border-border space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Monthly Price
                  </span>
                  <p className="text-xl font-semibold text-foreground flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{plan.currency}</span>{' '}
                    {plan.priceMonthly}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-border space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Annual Price
                  </span>
                  <p className="text-xl font-semibold text-foreground flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{plan.currency}</span>{' '}
                    {plan.priceAnnual}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Visibility
                  </span>
                  <span
                    className={`font-bold ${plan.isPublic ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}
                  >
                    {plan.isPublic ? 'Public Facing' : 'Invitation Only'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Stripe Sync
                  </span>
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                    {plan.stripePriceIdMonthly || 'No Link'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 px-4 rounded-xl bg-card hover:bg-white/[0.08] border border-border text-xs font-semibold text-foreground uppercase tracking-wide transition-all flex items-center justify-center gap-2">
                  <Layers className="w-4 h-4" /> Configure Limits
                </button>
                <button className="flex-1 py-3 px-4 rounded-xl bg-card hover:bg-white/[0.08] border border-border text-xs font-semibold text-foreground uppercase tracking-wide transition-all flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Manage Features
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create Card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="group p-8 rounded-3xl border border-dashed border-border hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500">
            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Advanced Product Mapping</h3>
            <p className="text-sm text-muted-foreground px-10">
              Provision a custom enterprise-grade tier with specific resource quotas and
              white-labeling capabilities.
            </p>
          </div>
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
            Launch Provisioner <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Global Billing Notice */}
      <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">Platform Billing Synchronization</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Changes to these pricing tiers must be manually synchronized with your Stripe Dashboard.
            Deleting a plan will NOT cancel existing subscriptions but will prevent new
            registrations for that tier. Always archive plans before deletion to maintain audit
            integrity.
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-md space-y-6">
            <h2 className="text-xl font-bold text-foreground">Create New Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  className="w-full bg-black border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Enterprise"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    value={newPlan.priceMonthly}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, priceMonthly: Number(e.target.value) })
                    }
                    className="w-full bg-black border border-border rounded-lg px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Annual Price ($)
                  </label>
                  <input
                    type="number"
                    value={newPlan.priceAnnual}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, priceAnnual: Number(e.target.value) })
                    }
                    className="w-full bg-black border border-border rounded-lg px-4 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-end pt-4 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
