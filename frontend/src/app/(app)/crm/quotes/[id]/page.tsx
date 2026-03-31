'use client';

import { useEffect, useState, use } from 'react';
import { 
  FileText, 
  Trash2, 
  Save, 
  ArrowLeft,
  Loader2,
  DollarSign,
  Plus,
  Printer,
  Share2,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Info,
  ChevronDown
} from 'lucide-react';
import { quoteService, Quote, QuoteStatus, QuoteLineItem } from '@/services/quote.service';
import { productService, Product } from '@/services/product.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Quote>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quoteRes, productRes] = await Promise.all([
        quoteService.getQuote(id),
        productService.getProducts()
      ]);
      const quoteData = (quoteRes as any).data.data;
      setQuote(quoteData);
      setFormData(quoteData);
      setProducts((productRes as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load quote details');
      router.push('/crm/quotes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const calculateTotals = (items: QuoteLineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.price * item.qty * (item.discount / 100)), 0);
    const taxAmount = (subtotal - discountAmount) * 0.1; // Default 10% tax for demo
    const total = subtotal - discountAmount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      lineItems: items,
      subtotal,
      discountAmount,
      taxAmount,
      total
    }));
  };

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      productId: '',
      description: 'New Item',
      qty: 1,
      price: 0,
      discount: 0
    };
    const newItems = [...(formData.lineItems || []), newItem];
    calculateTotals(newItems);
  };

  const removeLineItem = (index: number) => {
    const newItems = (formData.lineItems || []).filter((_, i) => i !== index);
    calculateTotals(newItems);
  };

  const updateLineItem = (index: number, updates: Partial<QuoteLineItem>) => {
    const newItems = [...(formData.lineItems || [])];
    newItems[index] = { ...newItems[index], ...updates };
    
    // If product changed, update price and description
    if (updates.productId) {
      const product = products.find(p => p.id === updates.productId);
      if (product) {
        newItems[index].price = product.price;
        newItems[index].description = product.name;
      }
    }
    
    calculateTotals(newItems);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await quoteService.updateQuote(id, formData);
      toast.success('Quote saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/crm/quotes" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotes
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-gray-100">
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content: The Invoice */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-card rounded-[40px] border border-gray-100 dark:border-border shadow-soft overflow-hidden">
            {/* Header */}
            <div className="p-10 lg:p-14 border-b border-gray-50 dark:border-border flex flex-col md:flex-row justify-between gap-10 bg-gray-50/30">
              <div>
                <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-2xl shadow-indigo-500/30">
                  <FileText className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Quote #{formData.number}</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Generated by AutopilotMonster CRM</p>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    quote?.status === QuoteStatus.ACCEPTED ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-500 border-gray-200"
                  )}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {formData.status}
                  </div>
                </div>
              </div>
              
              <div className="text-right md:pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Issue Date</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{new Date(quote!.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expiration Date</p>
                    <input 
                      type="date"
                      value={formData.validUntil?.split('T')[0] || ''}
                      onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                      className="text-sm font-black text-indigo-600 bg-transparent border-none p-0 text-right focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-10 lg:p-14">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Service Specifications</h3>
                <button 
                  onClick={addLineItem}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition hover:bg-indigo-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-border">
                      <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Product</th>
                      <th className="pb-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                      <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Price ({formData.currency})</th>
                      <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Disc %</th>
                      <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                      <th className="pb-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-border">
                    {formData.lineItems?.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-6 min-w-[300px]">
                          <select 
                            value={item.productId}
                            onChange={e => updateLineItem(idx, { productId: e.target.value })}
                            className="block w-full text-sm font-black text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 mb-1"
                          >
                            <option value="">Select a Product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <input 
                            value={item.description}
                            onChange={e => updateLineItem(idx, { description: e.target.value })}
                            className="block w-full text-[10px] font-bold text-gray-400 bg-transparent border-none p-0 focus:ring-0 uppercase tracking-tighter"
                            placeholder="Item description..."
                          />
                        </td>
                        <td className="py-6 text-center w-20">
                          <input 
                            type="number"
                            value={item.qty}
                            onChange={e => updateLineItem(idx, { qty: Number(e.target.value) })}
                            className="w-full text-center text-sm font-black text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                          />
                        </td>
                        <td className="py-6 text-right w-32">
                          <input 
                            type="number"
                            value={item.price}
                            onChange={e => updateLineItem(idx, { price: Number(e.target.value) })}
                            className="w-full text-right text-sm font-black text-gray-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                          />
                        </td>
                        <td className="py-6 text-right w-24">
                          <input 
                            type="number"
                            value={item.discount}
                            onChange={e => updateLineItem(idx, { discount: Number(e.target.value) })}
                            className="w-full text-right text-sm font-black text-indigo-600 bg-transparent border-none p-0 focus:ring-0"
                          />
                        </td>
                        <td className="py-6 text-right w-32 font-black text-sm text-gray-900 dark:text-white">
                          ${(item.qty * item.price * (1 - item.discount / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-6 text-right">
                          <button 
                            onClick={() => removeLineItem(idx)}
                            className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="mt-12 pt-12 border-t border-gray-100 dark:border-border flex justify-end">
                <div className="w-full lg:w-80 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span className="uppercase tracking-widest opacity-50">Subtotal</span>
                    <span className="font-black text-gray-900 dark:text-white">${formData.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-600">
                    <span className="uppercase tracking-widest opacity-60">Discount Applied</span>
                    <span className="font-black">-${formData.discountAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span className="uppercase tracking-widest opacity-50">Estimated Tax (10%)</span>
                    <span className="font-black text-gray-900 dark:text-white">${formData.taxAmount?.toLocaleString()}</span>
                  </div>
                  <div className="pt-6 border-t border-gray-100 dark:border-border flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Grand Total</span>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-indigo-600">${formData.total?.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{formData.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="p-10 lg:p-14 bg-gray-50/30 border-t border-gray-50 dark:border-border">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Professional Terms & Conditions</label>
              <textarea 
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-500 dark:text-gray-400 min-h-[100px] focus:ring-0 resize-none"
                placeholder="Include your legal terms, payment instructions, or project notes here..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar: Metadata & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-border shadow-soft p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Client Association</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-border">
                <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Associated Company</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">Acme Corp</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-border">
                <User className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Primary Contact</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">Alex Johnson</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-border shadow-soft p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6">Quote Status</h3>
            <div className="space-y-4">
              {Object.values(QuoteStatus).map(status => (
                <button
                  key={status}
                  onClick={() => setFormData({ ...formData, status })}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-between",
                    formData.status === status 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {status}
                  {formData.status === status && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
