"use client";

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, ExternalLink, Download, UserPlus, CheckCircle2, ChevronDown } from 'lucide-react';

const mockContacts = [
  { id: '1', name: 'John Smith', company: 'Acme Corp', role: 'VP of Sales', email: 'john@acme.co', phone: '+1 (555) 019-2831', status: 'Active', lastContact: '2 hours ago', score: 92 },
  { id: '2', name: 'Sarah Jenkins', company: 'TechFlow', role: 'CEO', email: 'sarah@techflow.io', phone: '+1 (555) 723-9912', status: 'Cold', lastContact: '14 days ago', score: 45 },
  { id: '3', name: 'Mike Chen', company: 'Nexus Systems', role: 'CTO', email: 'mike.c@nexus.dev', phone: '+1 (555) 883-2001', status: 'Warm', lastContact: '1 day ago', score: 78 },
  { id: '4', name: 'David Lee', company: 'OmniCorp', role: 'Director of Ops', email: 'dlee@omnicorp.net', phone: '+44 20 7123 4567', status: 'Active', lastContact: '5 hours ago', score: 88 },
  { id: '5', name: 'Jessica Alba', company: 'DataWorks Inc', role: 'Head of Data', email: 'jessica@dataworks.ai', phone: '+1 (555) 442-9988', status: 'New', lastContact: 'Just now', score: 65 },
  { id: '6', name: 'Bob Stone', company: 'LocalRetailer', role: 'Owner', email: 'bob@localbrand.com', phone: '+1 (555) 112-4432', status: 'Warm', lastContact: '3 days ago', score: 71 },
];

const statusStyles: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700 border-green-200',
  'Warm': 'bg-amber-100 text-amber-700 border-amber-200',
  'Cold': 'bg-slate-100 text-slate-700 border-slate-200',
  'New': 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function ContactsListPage() {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedContacts.size === mockContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(mockContacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedContacts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedContacts(next);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts Record</h1>
          <p className="text-sm text-muted-foreground">Manage your 12,489 CRM contacts and prospect leads.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm text-foreground hover:bg-muted transition-colors shadow-sm bg-background">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white font-medium text-sm rounded-lg transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80 border-r border-border pr-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..." 
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-input rounded-lg bg-background shadow-sm focus:ring-2 focus:ring-[hsl(246,80%,60%)] focus:outline-none transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" /> Filters <span className="bg-primary/10 text-primary px-1.5 rounded text-xs">2</span>
          </button>
        </div>

        {selectedContacts.size > 0 && (
          <div className="flex items-center gap-3 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] px-4 py-2 rounded-lg border border-[hsl(246,80%,60%)]/20 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-sm font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> {selectedContacts.size} Selected</span>
            <div className="h-4 w-px bg-[hsl(246,80%,60%)]/20 mx-1" />
            <button className="text-sm font-medium hover:underline">Add to Campaign</button>
            <button className="text-sm font-medium hover:underline ml-2">Delete</button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground">
                <th className="px-4 py-3.5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                    checked={selectedContacts.size === mockContacts.length && mockContacts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3.5 font-medium flex items-center gap-1 cursor-pointer hover:text-foreground">Name <ChevronDown className="w-3.5 h-3.5"/></th>
                <th className="px-4 py-3.5 font-medium">Company & Role</th>
                <th className="px-4 py-3.5 font-medium">Contact Details</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium cursor-pointer hover:text-foreground flex items-center gap-1">AI Score <ChevronDown className="w-3.5 h-3.5"/></th>
                <th className="px-4 py-3.5 font-medium">Last Activity</th>
                <th className="px-4 py-3.5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {mockContacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  className={`hover:bg-muted/20 transition-colors group ${selectedContacts.has(contact.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleSelect(contact.id)}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                    />
                  </td>
                  <td className="px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-border shadow-inner">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col cursor-pointer">
                      <span className="font-medium text-foreground">{contact.company}</span>
                      <span className="text-xs text-muted-foreground">{contact.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${contact.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {contact.email}
                      </a>
                      <a href={`tel:${contact.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {contact.phone}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 cursor-pointer">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyles[contact.status]}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="relative flex shrink-0 items-center justify-center">
                        {/* Fake circular progress */}
                        <svg className="w-8 h-8 -rotate-90">
                          <circle className="text-muted stroke-current" strokeWidth="3" cx="16" cy="16" r="14" fill="transparent" />
                          <circle className={`${contact.score > 80 ? 'text-green-500' : contact.score > 60 ? 'text-amber-500' : 'text-slate-400'} stroke-current transition-all duration-1000 ease-in-out`} strokeWidth="3" strokeDasharray={`${contact.score * 0.88} 100`} strokeLinecap="round" cx="16" cy="16" r="14" fill="transparent" />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-foreground">{contact.score}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground cursor-pointer">
                    {contact.lastContact}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing <strong>1</strong> to <strong>6</strong> of <strong>12,489</strong> contacts</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
