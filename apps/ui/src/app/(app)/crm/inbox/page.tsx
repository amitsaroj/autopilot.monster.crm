'use client';

import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Trash2, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Reply, 
  Forward,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { emailService, EmailMessage } from '@/services/email.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function InboxPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await emailService.getEmails();
        const data = (res as any).data.data || [];
        setEmails(data);
        if (data.length > 0) setSelectedEmail(data[0]);
      } catch (error) {
        toast.error('Failed to load inbox');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(e => 
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-black/20">
      {/* Sidebar - Folders */}
      <div className="w-64 border-r border-gray-100 dark:border-white/5 p-6 space-y-8 flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition active:scale-95">
          <Plus className="w-5 h-5" />
          Compose
        </button>

        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-4">Mailboxes</p>
          {[
            { label: 'Inbox', icon: Inbox, count: emails.filter(e => !e.isRead).length, active: true },
            { label: 'Sent', icon: Send, count: 0 },
            { label: 'Starred', icon: Star, count: 0 },
            { label: 'Trash', icon: Trash2, count: 0 },
          ].map(item => (
            <button 
              key={item.label}
              className={cn(
                "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all",
                item.active ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="w-[450px] border-r border-gray-100 dark:border-white/5 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 ring-indigo-500/20 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredEmails.map((email) => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={cn(
                "p-6 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-white/5 relative",
                selectedEmail?.id === email.id ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600" : ""
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-black text-xs">
                    {email.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[180px]">
                      {email.from}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold">{format(new Date(email.createdAt), 'MMM dd, h:mm a')}</p>
                  </div>
                </div>
                {!email.isRead && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>
              <p className="text-xs font-black text-gray-700 dark:text-gray-300 mb-1 truncate">{email.subject}</p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic">{email.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message Preview */}
      <div className="flex-1 bg-white dark:bg-card/50 flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
                  {selectedEmail.from.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-500">From:</span>
                    <span className="text-sm font-black text-indigo-600">{selectedEmail.from}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                  <Star className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 text-gray-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-12 overflow-y-auto bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="max-w-[800px] mx-auto space-y-8">
                <div className="bg-white dark:bg-card p-10 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center justify-between mb-8 opacity-50">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <Clock className="w-3 h-3" />
                      Received {format(new Date(selectedEmail.createdAt), 'MMMM d, yyyy @ h:mm a')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Sender
                    </div>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-wrap font-medium">
                    {selectedEmail.body}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition active:scale-95">
                    <Reply className="w-5 h-5" />
                    Reply
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-card text-gray-700 dark:text-white border border-gray-100 dark:border-white/5 rounded-2xl font-black hover:bg-gray-50 dark:hover:bg-white/5 transition active:scale-95">
                    <Forward className="w-5 h-5" />
                    Forward
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="p-8 rounded-full bg-gray-50 dark:bg-white/5 text-gray-300 mb-6">
              <Mail className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-black text-gray-400">Select a message to view</h3>
            <p className="text-gray-500 mt-2 italic">Your centralized communication hub is ready.</p>
          </div>
        )}
      </div>
    </div>
  );
}
