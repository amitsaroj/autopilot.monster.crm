'use client';

import { useEffect, useState, use } from 'react';
import { 
  Package, 
  Trash2, 
  Save, 
  ArrowLeft,
  Loader2,
  DollarSign,
  Tag,
  Layers,
  Archive,
  CheckCircle2,
  AlertCircle,
  Hash,
  Info
} from 'lucide-react';
import { productService, Product, BillingType } from '@/services/product.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProduct(id);
      const data = (res as any).data.data;
      setProduct(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load product details');
      router.push('/crm/products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await productService.updateProduct(id, formData);
      toast.success('Product updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      router.push('/crm/products');
    } catch (error) {
      toast.error('Failed to delete product');
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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/crm/products" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition underline text-[10px] font-black uppercase tracking-widest"
          >
            Delete Product
          </button>
          <button 
            type="submit"
            form="product-form"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-card rounded-[40px] border border-gray-100 dark:border-border shadow-soft p-8 text-center">
            <div className="w-24 h-24 mx-auto rounded-[32px] bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-2xl shadow-indigo-500/30">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {product?.name}
            </h2>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-6 uppercase tracking-[0.2em]">
              SKU: {product?.sku || 'N/A'}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-[10px] font-black text-gray-500 border border-gray-100 dark:border-border uppercase tracking-widest">
              <div className={cn(
                "w-2 h-2 rounded-full",
                product?.status === 'ACTIVE' ? "bg-emerald-500" : "bg-gray-300"
              )} />
              {product?.status}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 dark:border-border grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Standard Price</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">${Number(product?.price).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Billing Cycle</p>
                <p className="text-xs font-black text-indigo-600">{product?.billingType.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[40px] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricebook Ready
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                This product is currently listed in your master pricebook and available for all sales quotes.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Archive className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form id="product-form" onSubmit={handleUpdate} className="bg-white dark:bg-card rounded-[40px] border border-gray-100 dark:border-border shadow-soft overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Product Specifications</h3>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Product Name</label>
                <input
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Category</label>
                  <input
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                    placeholder="e.g. Software, Hardware"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">SKU / Item Code</label>
                  <div className="relative">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={formData.sku || ''}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold min-h-[120px] resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Pricing & Billing</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Unit Price ({formData.currency})</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Billing Frequency</label>
                  <select
                    value={formData.billingType}
                    onChange={e => setFormData({ ...formData, billingType: e.target.value as any })}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold appearance-none"
                  >
                    <option value={BillingType.ONE_TIME}>One Time</option>
                    <option value={BillingType.MONTHLY}>Monthly Subscription</option>
                    <option value={BillingType.ANNUAL}>Annual Subscription</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold text-blue-700 leading-relaxed">
                  Standardized pricing ensures consistency across all sales quotes. Updating the price here will affect all future quotes but will not retrospectively change existing ones.
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
