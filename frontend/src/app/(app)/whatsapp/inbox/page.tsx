"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  User, 
  CheckCircle2, 
  Bot, 
  Loader2,
  Phone,
  Video,
  ChevronLeft
} from 'lucide-react';
import api from '@/lib/api/client';
import { format } from 'date-fns';

interface Conversation {
  contact: string;
  lastMessage: string;
  timestamp: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  createdAt: string;
}

export default function SharedInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact);
    }
  }, [activeContact]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/v1/whatsapp/conversations');
      setConversations(res.data || []);
      if (res.data?.length > 0 && !activeContact) {
        setActiveContact(res.data[0].contact);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contact: string) => {
    setMessagesLoading(true);
    try {
      // In a real app, we'd filter by contact on the backend
      const res = await api.get('/v1/whatsapp/messages');
      const filtered = (res.data || []).filter((m: Message) => m.from === contact || m.to === contact);
      setMessages(filtered.reverse());
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContact || sending) return;
    setSending(true);
    try {
      await api.post('/v1/whatsapp/send', {
        to: activeContact,
        message: newMessage,
      });
      setNewMessage('');
      fetchMessages(activeContact);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.contact.toLowerCase().includes(search.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white border border-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-80 lg:w-96 border-r flex flex-col bg-gray-50/50 shrink-0">
        <div className="p-5 border-b bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Inbox
            </h1>
            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredConversations.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map(chat => (
              <div 
                key={chat.contact} 
                onClick={() => setActiveContact(chat.contact)}
                className={`p-4 cursor-pointer transition-all relative group ${activeContact === chat.contact ? 'bg-white shadow-sm z-10' : 'hover:bg-white/50'}`}
              >
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${activeContact === chat.contact ? 'bg-green-500 ring-4 ring-green-500/10' : 'bg-gray-400'}`}>
                    {chat.contact.substring(0, 2).replace('+', '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-bold text-sm text-gray-900 truncate">{chat.contact}</span>
                      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-2">
                        {format(new Date(chat.timestamp), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate leading-relaxed">{chat.lastMessage}</p>
                  </div>
                </div>
                {activeContact === chat.contact && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-green-500 rounded-r-full" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F0F2F5] relative">
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-green-500">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Select a conversation</h2>
              <p className="text-sm text-gray-500 max-w-xs">Pick a contact from the list to start messaging or view history.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shadow-sm z-20">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20">
                  {activeContact.substring(0, 2).replace('+', '')}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{activeContact}</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-green-600 uppercase tracking-tighter">AI Autopilot Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><Search className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                </div>
              ) : (
                messages.map((msg, i) => {
                  const showDate = i === 0 || format(new Date(msg.createdAt), 'yyyy-MM-dd') !== format(new Date(messages[i-1].createdAt), 'yyyy-MM-dd');
                  return (
                    <div key={msg.id} className="space-y-3">
                      {showDate && (
                        <div className="flex justify-center my-6">
                          <span className="bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm border border-white/50">
                            {format(new Date(msg.createdAt), 'MMMM do, yyyy')}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm border ${
                          msg.direction === 'OUTBOUND' 
                          ? 'bg-[#D9FDD3] border-[#C3EBBC] text-gray-800 rounded-tr-none' 
                          : 'bg-white border-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[9px] font-bold text-gray-400">
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </span>
                            {msg.direction === 'OUTBOUND' && (
                              <CheckCircle2 className={`w-3 h-3 ${msg.status === 'READ' ? 'text-blue-500' : 'text-gray-400'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-5 bg-white/80 backdrop-blur-md border-t z-20">
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 pr-2 shadow-inner">
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-200/50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <textarea 
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..." 
                  className="flex-1 px-3 py-2.5 bg-transparent focus:outline-none text-sm resize-none max-h-32"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                    !newMessage.trim() || sending 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600 active:scale-90 shadow-green-500/20'
                  }`}
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar - Contact Info */}
      {activeContact && (
        <div className="w-80 border-l bg-white flex flex-col hidden xl:flex">
          <div className="p-8 flex flex-col items-center border-b">
            <div className="w-24 h-24 rounded-3xl bg-green-500 flex items-center justify-center text-white text-3xl font-black mb-6 shadow-2xl shadow-green-500/20">
              {activeContact.substring(0, 2).replace('+', '')}
            </div>
            <h2 className="text-xl font-black text-gray-900 text-center break-all">{activeContact}</h2>
            <div className="mt-4 flex gap-2">
              <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 transition-colors"><Phone className="w-5 h-5" /></button>
              <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 transition-colors"><Video className="w-5 h-5" /></button>
              <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Status</h3>
              <div className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold">
                Active Lead
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Automation</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">AI Responder</span>
                <div className="w-10 h-5 bg-green-500 rounded-full relative shadow-inner">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>

            <button className="w-full mt-8 bg-black text-white font-bold py-4 rounded-2xl text-sm hover:bg-gray-800 transition-all shadow-xl active:scale-95">
              Open in CRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
