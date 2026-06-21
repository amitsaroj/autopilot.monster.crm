'use client';

import { Send, Bot, User, RefreshCw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { aiChatService } from '@/services/ai-chat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI assistant with access to your CRM data. Ask me anything about your contacts, deals, pipeline, or business insights.",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [streaming, setStreaming] = useState(false);

  async function handleSend() {
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setStreaming(true);

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const newConversationId = await aiChatService.streamMessage(
        userMessage,
        (chunk, convId) => {
          if (convId) setConversationId(convId);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
            }
            return updated;
          });
        },
        conversationId,
      );
      setConversationId(newConversationId);
    } catch {
      toast.error('Failed to get AI response');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function handleNewConversation() {
    setConversationId(undefined);
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm your AI assistant with access to your CRM data. Ask me anything about your contacts, deals, pipeline, or business insights.",
      },
    ]);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="page-header pb-4">
        <div>
          <h1 className="page-title">AI Chat</h1>
          <p className="page-description">Context-aware CRM intelligence powered by GPT-4</p>
        </div>
        <button
          onClick={handleNewConversation}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-[hsl(246,80%,60%)]' : 'bg-muted'}`}
            >
              {msg.role === 'assistant' ? (
                <Bot className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'assistant' ? 'bg-card border border-border' : 'bg-[hsl(246,80%,60%)] text-white'}`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
                {streaming && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-2xl bg-card p-3 flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Ask anything about your CRM, pipeline, contacts..."
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-foreground placeholder:text-muted-foreground max-h-32"
          rows={1}
          disabled={streaming}
        />
        <button
          onClick={() => void handleSend()}
          disabled={streaming || !input.trim()}
          className="p-2 rounded-xl bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] transition-colors disabled:opacity-50"
        >
          {streaming ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Send className="h-4 w-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
