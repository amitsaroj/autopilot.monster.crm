'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, Loader2, Package, Tag, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { ListPagination } from '@/components/ui/ListPagination';
import { usePaginatedCrmList } from '@/hooks/usePaginatedCrmList';
import { productService } from '@/services/product.service';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  status: string;
}

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    sku: '',
    category: 'General',
  });

  const fetchProducts = useCallback(
    (params: Parameters<typeof productService.getProducts>[0]) =>
      productService.getProducts(params),
    [],
  );

  const {
    items: products,
    meta,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload,
  } = usePaginatedCrmList<Product>(fetchProducts);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/products/${editingId}`, formData);
        toast.success('Asset configuration mutated');
      } else {
        await api.post('/crm/products', formData);
        toast.success('Asset initialized in lattice');
      }
      setIsModalOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Configuration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm dissolution of asset?')) return;
    try {
      await api.delete(`/crm/products/${id}`);
      toast.success('Asset dissolved');
      reload();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Dissolution failed');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0, sku: '', category: 'General' });
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      sku: product.sku || '',
      category: product.category || 'General',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
              Asset Inventory Active
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Product Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage marketable assets, pricing matrices & SKU vectors
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4" /> Initialize Asset
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-emerald-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-emerald-400" />
          <input
            type="text"
            placeholder="Search asset name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-700 dark:text-emerald-400" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-4">
            {error}
          </p>
          <button
            type="button"
            onClick={() => reload()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wide"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-8 rounded-xl bg-card border border-border hover:border-emerald-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-emerald-500/5 transition-colors pointer-events-none" />

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-[20px] bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shadow-2xl">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground group-hover:text-emerald-400 transition-colors uppercase tracking-tight mb-2 leading-none">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
                      ${product.price ? product.price.toLocaleString() : '0'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-card text-muted-foreground text-xs font-semibold uppercase tracking-wide border border-border">
                      {product.sku || 'NO-SKU'}
                    </span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      <Tag className="w-4 h-4 opacity-40 shrink-0" />{' '}
                      {product.category || 'General'}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium italic">
                      {product.description || 'No descriptive metadata assigned.'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">
                  No marketable assets detected currently.
                </p>
              </div>
            )}
          </div>
          <ListPagination meta={meta} page={page} onPageChange={setPage} />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-xl bg-card border border-border shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-semibold text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Package className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />{' '}
              {editingId ? 'Reconfigure Asset' : 'Initialize Asset'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Asset Designation
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40"
                    placeholder="Product or Service Name"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Price Vector (USD)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-card border border-border rounded-2xl pl-12 pr-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    SKU Identity
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40 tracking-wide"
                    placeholder="PROD-001"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Classification lattice
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40"
                    placeholder="e.g. Software, Services, Hardware"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    Descriptive Metadata
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-emerald-500/40 min-h-[100px] resize-none"
                    placeholder="Provide detailed asset specifications..."
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-border flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-card border-border border hover:bg-white/[0.05] text-foreground rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-emerald-500/20"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
