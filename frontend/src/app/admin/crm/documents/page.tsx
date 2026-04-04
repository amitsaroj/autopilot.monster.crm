"use client";

import { useState } from 'react';
import {
  FileText, Search, Plus, Filter, Download,
  Folder, File, Eye, Trash2, MoreVertical,
  Image, Archive, ArrowRight, Clock, User
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'IMAGE' | 'CSV' | 'OTHER';
  size: string;
  owner: string;
  linkedTo: string;
  tags: string[];
  createdAt: string;
}

const mockDocs: Document[] = [
  { id: '1', name: 'Sales Proposal Q1 2025.pdf', type: 'PDF', size: '2.4 MB', owner: 'Sarah K.', linkedTo: 'Acme Corp Deal', tags: ['proposal', 'sales'], createdAt: new Date().toISOString() },
  { id: '2', name: 'Contract_Acme_Corp.docx', type: 'DOCX', size: '345 KB', owner: 'Mike L.', linkedTo: 'Acme Corp', tags: ['contract', 'legal'], createdAt: new Date().toISOString() },
  { id: '3', name: 'Product Screenshot.png', type: 'IMAGE', size: '1.2 MB', owner: 'Priya M.', linkedTo: 'TechStartup X', tags: ['demo'], createdAt: new Date().toISOString() },
  { id: '4', name: 'Lead Export March.csv', type: 'CSV', size: '88 KB', owner: 'Admin', linkedTo: 'All Leads', tags: ['export', 'leads'], createdAt: new Date().toISOString() },
  { id: '5', name: 'Partnership Agreement 2025.pdf', type: 'PDF', size: '5.1 MB', owner: 'CEO', linkedTo: 'GlobalSales Inc', tags: ['legal', 'partnership'], createdAt: new Date().toISOString() },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  PDF: FileText,
  DOCX: FileText,
  IMAGE: Image,
  CSV: Archive,
  OTHER: File,
};

const TYPE_COLORS: Record<string, string> = {
  PDF: 'text-red-400 bg-red-500/10',
  DOCX: 'text-blue-400 bg-blue-500/10',
  IMAGE: 'text-purple-400 bg-purple-500/10',
  CSV: 'text-emerald-400 bg-emerald-500/10',
  OTHER: 'text-gray-400 bg-gray-500/10',
};

export default function AdminCRMDocumentsPage() {
  const [docs] = useState<Document[]>(mockDocs);
  const [search, setSearch] = useState('');

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.linkedTo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Documents</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Workspace Document Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search documents, contacts, deals..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Document', 'Type', 'Linked To', 'Owner', 'Size', 'Date', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(doc => {
              const Icon = TYPE_ICONS[doc.type] || File;
              const colorClass = TYPE_COLORS[doc.type] || 'text-gray-400 bg-gray-500/10';
              return (
                <tr key={doc.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass.split(' ')[1]}`}>
                        <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{doc.name}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {doc.tags.map(t => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-500 uppercase tracking-widest">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} border-current/20`}>{doc.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{doc.linkedTo}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <User className="w-3 h-3" />{doc.owner}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{doc.size}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />{new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Download className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
