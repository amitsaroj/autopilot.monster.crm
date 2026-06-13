'use client';

import { Send, Bot, User, Paperclip, Mic, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api/client';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant with access to your CRM data. Ask me anything about your contacts, deals, pipeline, or business insights." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userMessage,
        useRag,
        conversationId: conversationId || undefined,
      });

      const data = res.data || res;
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (err) {
      // Fallback response simulation
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: `I received: "${userMessage}". Simulated CRM reply. Add OpenAI key in AI Settings to fetch live completions.` 
        }]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      { role: 'assistant', content: "Hi! I'm your AI assistant with access to your CRM data. Ask me anything about your contacts, deals, pipeline, or business insights." }
    ]);
    setConversationId(null);
    toast.success('Started a new conversation stream.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/[0.05] pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Chat Copilot</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
            Context-aware CRM intelligence powered by RAG vector database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* RAG Toggle */}
          <button
            onClick={() => setUseRag(!useRag)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
              useRag 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                : 'border-white/10 text-gray-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {useRag ? 'RAG Enabled' : 'RAG Disabled'}
          </button>
          
          <button 
            onClick={handleNewConversation}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border border-white/10 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> New Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                : 'bg-white/5 border border-white/10 text-gray-400'
            }`}>
              {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
              msg.role === 'assistant' 
                ? 'bg-card border border-white/[0.05] text-gray-200 shadow-md' 
                : 'bg-indigo-500 text-white font-semibold'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-card border border-white/[0.05] rounded-2xl px-4 py-3 text-xs text-gray-500 font-bold uppercase tracking-wider animate-pulse">
              AI agent is composing reply...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="border border-white/10 rounded-2xl bg-card p-3 flex items-end gap-3 shadow-lg">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything about your CRM, pipeline, contacts..."
          className="flex-1 bg-transparent text-xs resize-none focus:outline-none text-white placeholder:text-gray-600 max-h-32 py-2 leading-relaxed"
          rows={1}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
