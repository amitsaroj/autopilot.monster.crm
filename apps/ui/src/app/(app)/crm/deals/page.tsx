"use client";

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar, Clock, ArrowRight, User, Activity } from 'lucide-react';

type Deal = {
  id: string;
  title: string;
  value: number;
  company: string;
  contact: string;
  probability: number;
  expectedClose: string;
  tags: string[];
};

type Column = {
  id: string;
  title: string;
  color: string;
  deals: Deal[];
};

const initialColumns: Column[] = [
  {
    id: 'col-1',
    title: 'Lead In',
    color: 'bg-slate-200 border-slate-300',
    deals: [
      { id: 'd-1', title: 'Enterprise Platform Upgrade', value: 45000, company: 'Acme Corp', contact: 'John Smith', probability: 20, expectedClose: 'Oct 15', tags: ['Enterprise', 'Q4'] },
      { id: 'd-2', title: 'Q3 Renewals Bundle', value: 12500, company: 'TechFlow', contact: 'Sarah Jenkins', probability: 40, expectedClose: 'Sep 30', tags: ['Renewal'] },
    ]
  },
  {
    id: 'col-2',
    title: 'Contact Made',
    color: 'bg-blue-100 border-blue-200',
    deals: [
      { id: 'd-3', title: 'API Integration Project', value: 8000, company: 'Nexus Systems', contact: 'Mike Chen', probability: 50, expectedClose: 'Nov 01', tags: ['Integration'] }
    ]
  },
  {
    id: 'col-3',
    title: 'Proposal Presented',
    color: 'bg-purple-100 border-purple-200',
    deals: [
      { id: 'd-4', title: 'Global License Expansion', value: 120000, company: 'OmniCorp', contact: 'David Lee', probability: 75, expectedClose: 'Oct 20', tags: ['Enterprise', 'Expansion'] },
      { id: 'd-5', title: 'Custom AI Agent Build', value: 35000, company: 'DataWorks Inc', contact: 'Jessica Alba', probability: 80, expectedClose: 'Oct 10', tags: ['AI Services'] }
    ]
  },
  {
    id: 'col-4',
    title: 'Negotiation',
    color: 'bg-amber-100 border-amber-200',
    deals: [
      { id: 'd-6', title: 'Standard SaaS Subscription', value: 4800, company: 'LocalRetailer', contact: 'Bob Stone', probability: 90, expectedClose: 'Sep 25', tags: ['SMB'] }
    ]
  },
  {
    id: 'col-5',
    title: 'Closed Won',
    color: 'bg-green-100 border-green-200',
    deals: []
  }
];

export default function DealsPipelinePage() {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedDealInfo, setDraggedDealInfo] = useState<{colId: string, dealId: string} | null>(null);

  const handleDragStart = (colId: string, dealId: string) => {
    setDraggedDealInfo({ colId, dealId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (targetColId: string) => {
    if (!draggedDealInfo) return;
    const { colId: sourceColId, dealId } = draggedDealInfo;
    
    if (sourceColId === targetColId) {
      setDraggedDealInfo(null);
      return;
    }

    const newCols = [...columns];
    const sourceColIndex = newCols.findIndex(c => c.id === sourceColId);
    const targetColIndex = newCols.findIndex(c => c.id === targetColId);

    const dealIndex = newCols[sourceColIndex].deals.findIndex(d => d.id === dealId);
    const [movedDeal] = newCols[sourceColIndex].deals.splice(dealIndex, 1);
    
    newCols[targetColIndex].deals.push(movedDeal);
    setColumns(newCols);
    setDraggedDealInfo(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in -mx-4 sm:mx-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Sales Pipeline 
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Q4 2024</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Drag and drop deals to update their status. Total Pipeline: <strong className="text-foreground">$225,300</strong></p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search deals..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:ring-2 focus:ring-[hsl(246,80%,60%)] focus:outline-none transition-shadow"
            />
          </div>
          <button className="p-2 border border-input rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0">
            <Filter className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white font-medium text-sm rounded-lg transition-colors shadow-sm shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Deal</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {columns.map(col => {
          const totalValue = col.deals.reduce((sum, d) => sum + d.value, 0);
          
          return (
            <div 
              key={col.id} 
              className="flex flex-col w-80 shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-xl border-t border-l border-r flex items-center justify-between shadow-sm sticky top-0 z-10 ${col.color}`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-gray-800">{col.title}</h3>
                  <span className="text-xs font-medium bg-white/50 text-gray-700 px-2 py-0.5 rounded-full">
                    {col.deals.length}
                  </span>
                </div>
                <button className="text-gray-500 hover:text-gray-900 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <div className={`px-3 py-2 text-xs font-semibold text-gray-600 bg-white/60 border-l border-r border-b mb-3 rounded-b-xl shadow-sm backdrop-blur-sm flex justify-between ${col.color.split(' ')[1]}`}>
                <span>Total Value</span>
                <span>${totalValue.toLocaleString()}</span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 flex flex-col gap-3 min-h-[150px] transition-colors rounded-xl p-1 bg-muted/30 border border-dashed border-transparent hover:border-muted-foreground/30">
                {col.deals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(col.id, deal.id)}
                    className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[hsl(246,80%,60%)] transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                  >
                    {/* Priority / Probability indicator strip */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500 opacity-70" />

                    <div className="flex justify-between items-start mb-2 pl-2">
                      <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight pr-4">
                        {deal.title}
                      </h4>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="pl-2 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-green-600 flex items-center">
                          <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                          {deal.value.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {deal.probability}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2Icon />
                        <span className="truncate">{deal.company}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{deal.contact}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {deal.expectedClose}
                        </div>
                        <div className="flex gap-1">
                          {deal.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {col.deals.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-sm text-muted-foreground opacity-50">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Temporary inline component for missing icon
function Building2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  );
}
