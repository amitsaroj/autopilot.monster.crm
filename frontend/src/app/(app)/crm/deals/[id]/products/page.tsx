'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { DealSubpage } from '@/components/crm/deal-subpage';
import { dealService } from '@/services/deal.service';

interface DealProduct {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  product?: { name: string };
}

export default function DealProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <DealSubpage params={params} title="Products">
      {(deal) => <ProductsList dealId={deal.id} />}
    </DealSubpage>
  );
}

function ProductsList({ dealId }: { dealId: string }) {
  const [items, setItems] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dealService.getProducts(dealId);
        setItems((res as { data: { data: DealProduct[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dealId]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No products linked to this deal.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground">
          <th className="py-2">Product</th>
          <th className="py-2">Qty</th>
          <th className="py-2">Unit price</th>
          <th className="py-2">Discount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b">
            <td className="py-2">{item.product?.name ?? item.productId}</td>
            <td className="py-2">{item.quantity}</td>
            <td className="py-2">${Number(item.unitPrice).toFixed(2)}</td>
            <td className="py-2">{item.discount}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
