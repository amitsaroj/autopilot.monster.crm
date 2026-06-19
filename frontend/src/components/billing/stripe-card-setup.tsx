'use client';

import { FormEvent, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { billingService } from '@/services/billing.service';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

interface StripeCardSetupFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

function CardSetupForm({ onComplete, onCancel }: StripeCardSetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'Card setup failed');
      setSubmitting(false);
      return;
    }

    const paymentMethodId =
      typeof result.setupIntent?.payment_method === 'string'
        ? result.setupIntent.payment_method
        : result.setupIntent?.payment_method?.id;

    if (!paymentMethodId) {
      setError('No payment method returned from Stripe');
      setSubmitting(false);
      return;
    }

    try {
      await billingService.attachPaymentMethod(paymentMethodId, true);
      onComplete();
    } catch {
      setError('Failed to save payment method');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Card'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted-foreground hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function StripeCardSetup({ onComplete, onCancel }: StripeCardSetupFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await billingService.createSetupIntent();
        setClientSecret(response.data.data.clientSecret);
      } catch {
        setError('Unable to initialize Stripe. Check billing configuration.');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Preparing secure card form...</p>;
  }

  if (error || !clientSecret) {
    return <p className="text-sm text-red-600">{error ?? 'Setup unavailable'}</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardSetupForm onComplete={onComplete} onCancel={onCancel} />
    </Elements>
  );
}
