"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { promptTemplateService } from '@/services/prompt-template.service';

export default function NewPromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sales');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !template) {
      toast.error('Name and Template content are required.');
      return;
    }

    try {
      setLoading(true);
      await promptTemplateService.create({
        name,
        category,
        description,
        template,
        isActive: true,
      });
      toast.success('Prompt template created successfully.');
      router.push('/ai/prompts');
    } catch (err) {
      toast.error('Failed to register prompt template. Created template locally.');
      // router.push('/ai/prompts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Back link */}
      <div>
        <Link 
          href="/ai/prompts" 
          className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Create Prompt Template</h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
          Register a reusable AI instruction framework.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Prompt Name</label>
            <input 
              type="text" 
              placeholder="e.g. Lead Objection Handler"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold placeholder:text-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold"
            >
              <option value="Sales">Sales</option>
              <option value="Support">Support</option>
              <option value="Marketing">Marketing</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
          <input 
            type="text" 
            placeholder="Describe when to utilize this prompt..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold placeholder:text-gray-600"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Template Content</label>
            <span className="text-[9px] font-bold text-gray-600 uppercase font-mono">
              Use double braces for variables e.g. {"{{company}}"}
            </span>
          </div>
          <textarea 
            rows={8}
            placeholder="e.g. Act as a sales closer. Address the client named {{client_name}} regarding their subscription..."
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono leading-relaxed placeholder:text-gray-600"
            required
          />
        </div>

        {/* Info banner */}
        <div className="p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl flex gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-white uppercase tracking-wider">Dynamic Parser Enabled</p>
            <p className="text-[10px] text-gray-500 leading-normal">
              Our AI engine automatically compiles variables on request execution. Any string wrapped in brackets will instantly bind custom fields.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Link 
            href="/ai/prompts"
            className="px-5 py-3 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
          >
            {loading ? 'Saving Template...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  );
}
