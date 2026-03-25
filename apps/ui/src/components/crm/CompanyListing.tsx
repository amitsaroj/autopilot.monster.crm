'use client';

import React from 'react';
import { 
  Building2, 
  Globe, 
  Phone, 
  MoreHorizontal, 
  Trash2, 
  ExternalLink,
  Users2,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  phone?: string;
  logoUrl?: string;
}

interface CompanyListingProps {
  companies: Company[];
  onDelete: (id: string) => void;
}

export function CompanyListing({ companies, onDelete }: CompanyListingProps) {
  if (companies.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] bg-gray-50/50">
        <Building2 className="w-16 h-16 mb-6 text-gray-200" />
        <h3 className="text-xl font-black text-gray-400 mb-2">No Companies Found</h3>
        <p className="text-sm text-gray-400 max-w-xs text-center">Start building your B2B network by adding your first organizational account.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {companies.map((company, idx) => (
        <motion.div
          key={company.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="group relative bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-soft hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-[22px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 overflow-hidden group-hover:scale-110 transition-transform">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            
            <button 
              onClick={() => onDelete(company.id)}
              className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded-xl text-rose-500 transition-all active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 line-clamp-1 tracking-tight">{company.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" />
                {company.industry || 'General Business'}
              </span>
            </div>
            
            <div className="space-y-3">
              {company.website && (
                <a 
                  href={`https://${company.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs font-bold text-gray-400 hover:text-indigo-600 transition truncate"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {company.website}
                </a>
              )}
              {company.phone && (
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <Phone className="w-3.5 h-3.5" />
                  {company.phone}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-card bg-gray-100 flex items-center justify-center overflow-hidden">
                  <Users2 className="w-3 h-3 text-gray-400" />
                </div>
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-card bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">+5</div>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
              View Account
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 19L19 5M19 5H8M19 5V16" />
  </svg>
);
