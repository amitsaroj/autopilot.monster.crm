'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';

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
  const [actionLoading, setActionLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

  const loadQuote = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/crm/quotes/view/${params.token}`);
      setQuote(response.data.data);
      setError(null);
    } catch {
      setError('Quote not found or link has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.token) {
      void loadQuote();
    }
  }, [params.token]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${baseUrl}/crm/quotes/view/${params.token}/accept`);
      await loadQuote();
    } catch {
      setError('Unable to accept quote.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${baseUrl}/crm/quotes/view/${params.token}/decline`);
      await loadQuote();
    } catch {
      setError('Unable to decline quote.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`${baseUrl}/crm/quotes/view/${params.token}/pdf`, '_blank');
  };

  const canRespond =
    quote &&
    !['ACCEPTED', 'DECLINED', 'EXPIRED'].includes(quote.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading quote...
      </div>
    );
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
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
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

        {canRespond && (
          <div className="flex gap-3 border-t pt-6">
            <button
              onClick={() => void handleAccept()}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Accept Quote
            </button>
            <button
              onClick={() => void handleDecline()}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Decline
            </button>
          </div>
        )}

        {quote.status === 'ACCEPTED' && (
          <p className="text-center text-green-600 text-sm font-medium">
            This quote has been accepted. Thank you!
          </p>
        )}

        {quote.status === 'DECLINED' && (
          <p className="text-center text-gray-500 text-sm">
            This quote was declined.
          </p>
        )}
      </div>
    </div>
  );
}
