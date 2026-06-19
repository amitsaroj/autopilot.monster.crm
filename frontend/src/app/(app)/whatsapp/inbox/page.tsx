'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, MessageSquare, Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  whatsappConversationService,
  WhatsAppConversationSummary,
  WhatsAppMessage,
} from '@/services/whatsapp-conversation.service';

export default function SharedInboxPage() {
  const [conversations, setConversations] = useState<WhatsAppConversationSummary[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await whatsappConversationService.list();
      const items = res.data.data ?? [];
      setConversations(items);
      if (!activePhone && items.length > 0) {
        setActivePhone(items[0].phone);
      }
    } catch {
      toast.error('Failed to load inbox');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (phone: string) => {
    try {
      const res = await whatsappConversationService.getMessages(phone);
      setMessages(res.data.data ?? []);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (activePhone) {
      void loadMessages(activePhone);
    }
  }, [activePhone]);

  const activeConversation = conversations.find((item) => item.phone === activePhone);
  const filtered = conversations.filter((item) => {
    const haystack = `${item.contactName ?? ''} ${item.phone} ${item.lastMessage}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const handleSend = async () => {
    if (!activePhone || !draft.trim()) return;
    setSending(true);
    try {
      await whatsappConversationService.send(activePhone, draft.trim());
      setDraft('');
      await loadMessages(activePhone);
      await loadConversations();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!activePhone) return;
    try {
      await whatsappConversationService.resolve(activePhone);
      toast.success('Conversation resolved');
      await loadConversations();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border rounded-xl overflow-hidden shadow-sm animate-fade-in max-w-7xl">
      <div className="w-80 border-r flex flex-col bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Shared Inbox
            </h1>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No conversations.</p>
          ) : (
            filtered.map((chat) => (
              <div
                key={chat.phone}
                onClick={() => setActivePhone(chat.phone)}
                className={`p-4 border-b cursor-pointer transition-colors ${activePhone === chat.phone ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-semibold text-sm ${activePhone === chat.phone ? 'text-green-900' : 'text-gray-900'}`}>
                    {chat.contactName ?? chat.phone}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate pr-4">{chat.lastMessage}</span>
                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#efeae2]">
        <div className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm z-10">
          <div>
            <h2 className="font-semibold text-gray-900 leading-tight">
              {activeConversation?.contactName ?? activePhone ?? 'Select a conversation'}
            </h2>
            {activeConversation && (
              <span className="text-xs text-gray-500">{activeConversation.status}</span>
            )}
          </div>
          {activePhone && (
            <button
              type="button"
              onClick={() => void handleResolve()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!activePhone ? (
            <p className="text-center text-sm text-gray-500">Select a conversation</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-md shadow-sm text-sm ${
                    msg.direction === 'OUTBOUND'
                      ? 'bg-[#d9fdd3] border border-[#c3ebbc] text-gray-800'
                      : 'bg-white border border-gray-100 text-gray-800'
                  }`}
                >
                  {msg.body}
                  <div className="text-[10px] text-gray-400 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex items-center gap-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder="Type a message..."
            disabled={!activePhone}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!activePhone || !draft.trim() || sending}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
