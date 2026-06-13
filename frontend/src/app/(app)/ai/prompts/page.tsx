"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Cpu, Trash2, Eye, Edit2, Play, Code, CheckCircle, Copy, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { promptTemplateService, PromptTemplate } from '@/services/prompt-template.service';

export default function AIPromptsPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Interactive rendering state
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [renderResult, setRenderResult] = useState<string>('');
  const [rendering, setRendering] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await promptTemplateService.findAll();
      setTemplates(res || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setTemplates([
        { id: '1', name: 'Lead Inbound Qualifier', category: 'Sales', template: 'Act as a lead qualifier. Analyze the context of this lead: {{lead_name}} works at {{company_name}} and is looking for {{service_needed}}. Qualify this lead.', description: 'Used to score and route leads in CRM pipeline', isActive: true, tenantId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', name: 'SaaS Escalation Router', category: 'Support', template: 'Summarize support ticket {{ticket_id}} from user {{user_name}} and identify if it requires engineering intervention based on: {{issue_description}}.', description: 'Auto-routes tickets to engineers', isActive: true, tenantId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Parse variables from template string like {{variable_name}}
  const parseVariables = (templateStr: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(templateStr)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  useEffect(() => {
    if (selectedTemplate) {
      const vars = parseVariables(selectedTemplate.template);
      const initialVars: Record<string, string> = {};
      vars.forEach(v => {
        initialVars[v] = '';
      });
      setVariables(initialVars);
      setRenderResult('');
    } else {
      setVariables({});
      setRenderResult('');
    }
  }, [selectedTemplate]);

  const handleRender = async () => {
    if (!selectedTemplate) return;
    try {
      setRendering(true);
      const res = await promptTemplateService.render(selectedTemplate.id, variables);
      setRenderResult(res.rendered || '');
      toast.success('Prompt rendered successfully.');
    } catch (e) {
      // Local fallback render
      let temp = selectedTemplate.template;
      for (const [key, value] of Object.entries(variables)) {
        temp = temp.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
      }
      setRenderResult(temp);
      toast.info('Rendered locally (using fallback interpreter).');
    } finally {
      setRendering(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt template?')) return;
    try {
      await promptTemplateService.remove(id);
      toast.success('Prompt template deleted.');
      fetchTemplates();
    } catch (e) {
      toast.error('Failed to delete prompt template.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const categories = ['ALL', 'Sales', 'Support', 'Marketing', 'Custom'];
  
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.05] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Library</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Prompt Library</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Manage and test prompt templates utilized by your AI agents.
          </p>
        </div>
        <Link 
          href="/ai/prompts/new"
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Prompt
        </Link>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex border-b border-white/[0.05] gap-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative ${
                selectedCategory === cat 
                  ? 'text-indigo-400 border-b-2 border-indigo-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all font-bold placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-500 uppercase tracking-widest">
              Syncing Prompt Registry...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.01] border border-white/[0.05] rounded-3xl text-xs font-bold text-gray-500 uppercase tracking-widest">
              No prompt templates matching filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((t) => (
                <div 
                  key={t.id} 
                  className={`p-5 rounded-2xl border transition-all hover:bg-white/[0.02] flex flex-col justify-between group cursor-pointer ${
                    selectedTemplate?.id === t.id 
                      ? 'bg-indigo-500/[0.03] border-indigo-500/30' 
                      : 'bg-white/[0.01] border-white/[0.05]'
                  }`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {t.category}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedTemplate(t); }}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-white mb-2 group-hover:text-indigo-400 transition-colors">{t.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{t.description || 'No description provided.'}</p>
                  </div>

                  <div className="border-t border-white/[0.03] pt-4 mt-auto">
                    <pre className="text-[10px] text-gray-600 font-mono truncate leading-normal bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                      {t.template}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Testing Console */}
        <div className="lg:col-span-1">
          {selectedTemplate ? (
            <div className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-6 sticky top-6">
              <div>
                <h3 className="font-bold text-white text-sm">Template Playground</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mt-1">{selectedTemplate.name}</p>
              </div>

              {/* Template Definition */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Template</label>
                <div className="p-3 bg-black/40 border border-white/[0.05] rounded-xl text-[10px] text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
                  {selectedTemplate.template}
                </div>
              </div>

              {/* Variables Forms */}
              {Object.keys(variables).length > 0 && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" /> Bind Variables
                  </label>
                  <div className="space-y-3">
                    {Object.keys(variables).map((variable) => (
                      <div key={variable} className="space-y-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-wider font-mono">
                          {variable}
                        </label>
                        <input 
                          type="text" 
                          placeholder={`Enter value for ${variable}`}
                          value={variables[variable]}
                          onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execute / Render Action */}
              <div className="pt-2">
                <button
                  onClick={handleRender}
                  disabled={rendering}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> Render Prompt
                </button>
              </div>

              {/* Render Output */}
              {renderResult && (
                <div className="space-y-2 pt-4 border-t border-white/[0.05]">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rendered Prompt</label>
                    <button 
                      onClick={() => copyToClipboard(renderResult)}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy output"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3.5 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {renderResult}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center text-gray-500 py-16 sticky top-6">
              <Cpu className="w-8 h-8 text-gray-600 mb-4 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">Preview Console</p>
              <p className="text-[10px] text-gray-600 max-w-[200px] mt-2">
                Select any prompt template from the library list to test variable mapping, evaluate renders, and run playground checks.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
