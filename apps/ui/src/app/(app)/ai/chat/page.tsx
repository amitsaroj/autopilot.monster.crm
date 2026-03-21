'use client';
import { Send, Bot, User, Paperclip, Mic, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const initialMessages = [
  { role: 'assistant', content: 'Hi! I\'m your AI assistant with access to your CRM data. Ask me anything about your contacts, deals, pipeline, or business insights.' },
  { role: 'user', content: 'How many open deals do we have this month and what is the total pipeline value?' },
  { role: 'assistant', content: '**284 open deals** with a total pipeline value of **$284,500**.\n\nBreakdown by stage:\n- Prospecting: 89 deals ($82k)\n- Qualification: 64 deals ($74k)\n- Proposal: 58 deals ($68k)\n- Negotiation: 42 deals ($52k)\n- Closing: 31 deals ($8k)\n\nTop deal this month: GlobalInc CRM Migration at $92k.' },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="page-header pb-4">
        <div>
          <h1 className="page-title">AI Chat</h1>
          <p className="page-description">Context-aware CRM intelligence powered by GPT-4</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> New Conversation
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-[hsl(246,80%,60%)]' : 'bg-muted'}`}>
              {msg.role === 'assistant' ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'assistant' ? 'bg-card border border-border' : 'bg-[hsl(246,80%,60%)] text-white'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border border-border rounded-2xl bg-card p-3 flex items-end gap-3">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Paperclip className="h-4 w-4 text-muted-foreground" /></button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your CRM, pipeline, contacts..."
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground max-h-32"
          rows={1}
        />
        <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Mic className="h-4 w-4 text-muted-foreground" /></button>
        <button onClick={handleSend} className="p-2 rounded-xl bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] transition-colors">
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
