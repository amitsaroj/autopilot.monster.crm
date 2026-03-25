'use client';

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Database,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { importExportService } from '@/services/import-export.service';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityType: 'lead' | 'contact';
}

export function CsvImportModal({ isOpen, onClose, onSuccess, entityType }: CsvImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length > 0) {
          const cols = lines[0].split(',').map(h => h.trim());
          setHeaders(cols);
          
          // Initial auto-mapping
          const newMapping: Record<string, string> = {};
          const targetFields = entityType === 'lead' ? ['firstName', 'lastName', 'email', 'phone'] : ['firstName', 'lastName', 'email', 'phone', 'jobTitle'];
          targetFields.forEach(field => {
            const match = cols.find(h => h.toLowerCase().includes(field.toLowerCase()));
            if (match) newMapping[field] = match;
          });
          setMapping(newMapping);

          const parsedData = lines.slice(1).map(line => {
            const values = line.split(',');
            const row: any = {};
            cols.forEach((h, i) => row[h] = values[i]?.trim() || '');
            return row;
          });
          setCsvData(parsedData);
          setStep('mapping');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setStep('importing');
    try {
      const mappedData = csvData.map(row => {
        const item: any = {};
        Object.entries(mapping).forEach(([target, source]) => {
          item[target] = row[source];
        });
        return item;
      });

      await importExportService.importData(entityType, mappedData);
      toast.success(`Successfully imported ${mappedData.length} ${entityType}s`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Import failed. Please check your data format.');
      setStep('mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-card w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
      >
        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Import {entityType === 'lead' ? 'Leads' : 'Contacts'}</h2>
              <p className="text-sm text-gray-500 font-bold">Upload a CSV file to bulk populate your CRM.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 min-h-[350px]">
          {step === 'upload' && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] p-12 bg-gray-50/50 dark:bg-white/[0.02] group hover:border-indigo-500/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-card shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Drop your CSV here</h3>
              <p className="text-sm text-gray-500 font-bold mb-8 text-center max-w-[280px]">
                Make sure your first row contains headers like name, email, etc.
              </p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="hidden" 
                id="csv-upload" 
              />
              <label 
                htmlFor="csv-upload"
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition cursor-pointer active:scale-95"
              >
                Select CSV File
              </label>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-4">
                <Database className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Step 2: Field Mapping</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Map your CSV columns to CRM fields.</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto px-1 custom-scrollbar">
                {(entityType === 'lead' ? ['firstName', 'lastName', 'email', 'phone'] : ['firstName', 'lastName', 'email', 'phone', 'jobTitle']).map(field => (
                  <div key={field} className="flex items-center justify-between p-4 bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-2xl group hover:border-indigo-200 transition">
                    <span className="text-sm font-black text-gray-700 dark:text-gray-300 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <select 
                        value={mapping[field] || ''} 
                        onChange={(e) => setMapping(prev => ({ ...prev, [field]: e.target.value }))}
                        className="bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 ring-indigo-500/20"
                      >
                        <option value="">Select Column</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button 
                  onClick={() => setStep('upload')}
                  className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white rounded-2xl font-black hover:bg-gray-200 transition"
                >
                  Back
                </button>
                <button 
                  onClick={handleImport}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Start Import
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="h-full flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Processing Data...</h3>
              <p className="text-gray-500 font-bold mt-2">Uploading and indexing your records.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
