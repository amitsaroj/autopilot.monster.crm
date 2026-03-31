'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  DollarSign, 
  Tag, 
  Layers, 
  Archive,
  Loader2,
  ChevronRight,
  ShoppingCart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { productService, Product, BillingType } from '@/services/product.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts();
      setProducts((res as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your offerings and standardized pricebooks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl font-bold text-sm hover:bg-gray-50 transition shadow-soft">
            <Archive className="w-4 h-4" />
            Export Pricebook
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-xl shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card shadow-soft text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat as string}
              onClick={() => setSelectedCategory(cat as string)}
              className={cn(
                "px-6 py-4 rounded-2xl font-bold text-xs whitespace-nowrap transition border",
                selectedCategory === cat 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-white dark:bg-card border-gray-100 dark:border-border text-gray-500 hover:border-indigo-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Link 
            key={product.id}
            href={`/crm/products/${product.id}`}
            className="group block bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border shadow-soft hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/50 transition overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition">
                  <Package className="w-6 h-6" />
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                    product.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                )}>
                  {product.status}
                </div>
              </div>

              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition">
                {product.name}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                SKU: {product.sku || 'N/A'} • {product.category || 'Standard'}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10">
                {product.description || 'No description provided for this catalog item.'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-border">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Price Point</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-gray-900 dark:text-white">${Number(product.price).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{product.currency}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Billing</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{product.billingType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-border rounded-[40px] bg-gray-50/50">
            <ShoppingCart className="w-12 h-12 mb-4 text-gray-200" />
            <h3 className="text-lg font-black text-gray-400 mb-1">Catalog Empty</h3>
            <p className="text-sm text-gray-400">No products match your current search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
