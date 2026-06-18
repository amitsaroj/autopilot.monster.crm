'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface QuoteLineItem {
  description: string;
  qty: number;
  price: number;
  discount: number;
}

interface PublicQuote {
  number: string;
  status: string;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  lineItems: QuoteLineItem[];
  notes?: string;
  validUntil?: string;
}

export default function PublicQuoteViewPage() {
  const params = useParams<{ token: string }>();
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
        const response = await axios.get(`${baseUrl}/crm/quotes/view/${params.token}`);
        setQuote(response.data.data);
      } catch {
        setError('Quote not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      void load();
    }
  }, [params.token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading quote...</div>;
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error ?? 'Quote unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote {quote.number}</h1>
            <p className="text-sm text-gray-500 mt-1">Status: {quote.status}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Price</th>
              <th className="py-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{item.description}</td>
                <td className="py-3">{item.qty}</td>
                <td className="py-3">{item.price}</td>
                <td className="py-3 text-right">
                  {(item.qty * item.price * (1 - item.discount / 100)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-sm text-right">
          <p>Subtotal: {quote.currency} {quote.subtotal}</p>
          <p>Discount: {quote.currency} {quote.discountAmount}</p>
          <p>Tax: {quote.currency} {quote.taxAmount}</p>
          <p className="text-lg font-bold">Total: {quote.currency} {quote.total}</p>
        </div>

        {quote.notes && (
          <div className="text-sm text-gray-600 border-t pt-4">
            <p className="font-medium text-gray-800 mb-1">Notes</p>
            <p>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
