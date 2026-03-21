"use client";

import { useState } from 'react';
import { UploadCloud, FileText, Database, Search, MoreVertical, RefreshCw, Trash2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI OS</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vector Data Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload documents to power your RAG engine and AI copilot agents.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
          <Database className="w-4 h-4" /> Sync Vectors
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Upload Zone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Upload Documents</h2>
            
            {/* Drag & Drop Zone */}
            <div className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors group">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm mb-4 border border-border group-hover:-translate-y-1 transition-transform">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Drop files here to upload</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                Supported formats: PDF, DOCX, TXT. Max size: 25MB per file.
              </p>
              <button className="mt-6 px-4 py-2 bg-background border border-input rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
                Browse Files
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Processing Queue</h4>
              
              {/* Fake Uploading File */}
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate max-w-[150px]">enterprise_sla_2024.pdf</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">65%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">Generating embeddings (model: text-embedding-3-small)</p>
              </div>

            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-green-800">Tenant Data Isolation</h4>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                All uploaded vectors are strictly isolated to your tenant UUID in Qdrant, ensuring complete privacy from other workspaces.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Indexed Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Indexed Knowledge</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
              />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Filename</th>
                  <th className="px-5 py-3.5 font-medium">Tokens Chunked</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Indexed Date</th>
                  <th className="px-5 py-3.5 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'sales_playbook_q3.pdf', tokens: '14,289', status: 'Ready', date: 'Oct 02, 2024' },
                  { name: 'api_documentation_v2.docx', tokens: '89,102', status: 'Ready', date: 'Sep 28, 2024' },
                  { name: 'objection_handling_scripts.txt', tokens: '4,510', status: 'Ready', date: 'Sep 25, 2024' },
                  { name: 'product_catalog_2024.pdf', tokens: '45,992', status: 'Ready', date: 'Sep 10, 2024' },
                  { name: 'competitor_analysis_matrix.xlsx', tokens: '12,045', status: 'Failed', date: 'Sep 05, 2024' },
                ].map((doc, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 font-medium text-foreground">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="truncate max-w-[180px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{doc.tokens}</td>
                    <td className="px-5 py-4">
                      {doc.status === 'Ready' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                          <Zap className="w-3 h-3" /> Ready for AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                          Error Parsing
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{doc.date}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Re-sync">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Vectors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
