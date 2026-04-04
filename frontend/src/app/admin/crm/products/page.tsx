"use client";

import { useState } from 'react';
import {
  Package, Search, Plus, Edit2, Trash2,
  Tag, DollarSign, BarChart3, ArrowUpRight,
  Star, CheckCircle2, Archive, Eye
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  dealsAttached: number;
  revenue: number;
  description: string;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Starter Plan', sku: 'PLN-001', category: 'Subscription', price: 49, currency: 'USD', status: 'ACTIVE', dealsAttached: 42, revenue: 31280, description: 'Up to 5 users, core CRM features' },
  { id: '2', name: 'Growth Plan', sku: 'PLN-002', category: 'Subscription', price: 149, currency: 'USD', status: 'ACTIVE', dealsAttached: 28, revenue: 87340, description: 'Up to 25 users, AI features included' },
  { id: '3', name: 'Enterprise Plan', sku: 'PLN-003', category: 'Subscription', price: 499, currency: 'USD', status: 'ACTIVE', dealsAttached: 12, revenue: 124500, description: 'Unlimited users, SSO, dedicated support' },
  { id: '4', name: 'WhatsApp Add-on', sku: 'ADD-001', category: 'Add-on', price: 29, currency: 'USD', status: 'ACTIVE', dealsAttached: 18, revenue: 9860, description: 'WhatsApp Business API integration' },
  { id: '5', name: 'AI Voice Module', sku: 'ADD-002', category: 'Add-on', price: 79, currency: 'USD', status: 'INACTIVE', dealsAttached: 0, revenue: 0, description: 'Advanced voice calling with AI transcription' },
  { id: '6', name: 'Legacy Startup Pack', sku: 'PLN-000', category: 'Subscription', price: 19, currency: 'USD', status: 'ARCHIVED', dealsAttached: 5, revenue: 1900, description: 'Discontinued plan, legacy customers only' },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ARCHIVED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminCRMProductsPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Products</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Product & Pricing Catalog</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: Package },
          { label: 'Active', value: products.filter(p => p.status === 'ACTIVE').length, icon: CheckCircle2 },
          { label: 'Deals Attached', value: products.reduce((s, p) => s + p.dealsAttached, 0), icon: BarChart3 },
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10"><s.icon className="w-5 h-5 text-indigo-400" /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search products or SKU..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'ACTIVE', 'INACTIVE', 'ARCHIVED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(product => (
          <div key={product.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                <Package className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${STATUS_STYLES[product.status]}`}>{product.status}</span>
            </div>
            <div className="mb-2">
              <span className="text-[10px] font-mono text-gray-600">{product.sku}</span>
              <span className="text-gray-700 mx-2">·</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{product.category}</span>
            </div>
            <h3 className="text-base font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">{product.description}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Price</p>
                <p className="text-xl font-black text-white">${product.price}<span className="text-xs text-gray-600 font-normal">/mo</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Revenue</p>
                <p className="text-base font-black text-emerald-400">${product.revenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-white/[0.04]">
              <button className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
              </button>
              <button className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
