"use client";

import { useState } from 'react';
import { MessageSquare, Search, Filter, Phone, Video, MoreVertical, Send, User, CheckCircle2, Bot, Clock } from 'lucide-react';

export default function SharedInboxPage() {
  const [activeChat, setActiveChat] = useState<number>(1);
  const [message, setMessage] = useState('');

  const chats = [
    { id: 1, name: 'Acme Corp Support', lastMsg: 'I need help with my billing.', time: '10:42 AM', unread: 2, isActive: true },
    { id: 2, name: '+1 (555) 019-2831', lastMsg: 'Is the enterprise plan available?', time: 'Yesterday', unread: 0, isActive: false },
    { id: 3, name: 'Sarah Jenkins', lastMsg: 'Thanks, I will check the docs.', time: 'Tuesday', unread: 0, isActive: false },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border rounded-xl overflow-hidden shadow-sm animate-fade-in max-w-7xl">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r flex flex-col bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Shared Inbox
            </h1>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Filter className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 border-b cursor-pointer transition-colors ${activeChat === chat.id ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-semibold text-sm ${activeChat === chat.id ? 'text-green-900' : 'text-gray-900'}`}>{chat.name}</span>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate pr-4">{chat.lastMsg}</span>
                {chat.unread > 0 && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{chat.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2]"> {/* WhatsApp background color */}
        
        {/* Chat Header */}
        <div className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              AC
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 leading-tight">Acme Corp Support</h2>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Bot className="w-3 h-3" /> Handled by AI Agent (Sales)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Search className="w-5 h-5" /></button>
            <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="flex justify-center">
            <span className="bg-white/80 px-3 py-1 rounded-lg text-xs font-medium text-gray-500 shadow-sm backdrop-blur-sm">Today</span>
          </div>

          <div className="flex justify-start">
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 max-w-md shadow-sm border border-gray-100">
              <p className="text-sm text-gray-800">Hi, I'm trying to figure out if your billing system supports multi-currency options for EMEA region?</p>
              <div className="text-[10px] text-gray-400 text-right mt-1">10:40 AM</div>
            </div>
          </div>

          {/* AI Reply */}
          <div className="flex justify-end">
            <div className="bg-[#d9fdd3] rounded-lg rounded-tr-none px-4 py-2 max-w-md shadow-sm border border-[#c3ebbc]">
              <div className="flex items-center gap-1 mb-1">
                <Bot className="w-3 h-3 text-green-700" />
                <span className="text-xs font-semibold text-green-700">AI Response</span>
              </div>
              <p className="text-sm text-gray-800">Hello! Yes, our platform supports multi-currency natively. You can configure EUR, GBP, and USD inside the tenant billing settings panel.</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-gray-500">10:41 AM</span>
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 max-w-md shadow-sm border border-gray-100">
              <p className="text-sm text-gray-800">I need help with my billing. Can a human jump in?</p>
              <div className="text-[10px] text-gray-400 text-right mt-1">10:42 AM</div>
            </div>
          </div>
          
          {/* System Notification */}
          <div className="flex justify-center my-4">
            <div className="bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-lg text-xs font-medium text-yellow-800 shadow-sm flex items-center gap-2">
              <User className="w-4 h-4" /> AI pauses conversation. Assigned to Human Queue.
            </div>
          </div>

        </div>

        {/* Chat Input */}
        <div className="p-4 bg-gray-50 border-t flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-sm"
          />
          <button 
            disabled={!message.trim()}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>

      </div>

      {/* Right Sidebar - Contact Info */}
      <div className="w-72 border-l bg-white flex flex-col hidden lg:flex">
        <div className="p-6 flex flex-col items-center border-b">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
            AC
          </div>
          <h2 className="text-lg font-bold text-gray-900 text-center">Acme Corp Support</h2>
          <p className="text-sm text-gray-500">+1 (555) 019-2831</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">CRM Details</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 block">Status</span>
              <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded mt-1 inline-block">Enterprise Lead</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Owner</span>
              <span className="text-sm text-gray-900 mt-1 flex items-center gap-2"><User className="w-4 h-4"/> Amit S.</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Active Deal</span>
              <span className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">$12,000 / MRR</span>
            </div>
          </div>

          <button className="w-full mt-8 bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            View in CRM
          </button>
        </div>
      </div>
    </div>
  );
}
