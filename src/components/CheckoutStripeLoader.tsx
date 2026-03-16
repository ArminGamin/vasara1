import React, { useState, useEffect } from 'react';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import StripeCardSection from './StripeCardSection';

const STRIPE_PK = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;

// Bridge component that exposes a pay() function via ref so parent can trigger payment
function StripePayBridge({
  payRef,
  orderIdRef,
  customer,
  items,
  giftWrapping
}: {
  payRef: React.MutableRefObject<null | (() => Promise<{ ok: boolean; error?: string }>)>;
  orderIdRef: React.MutableRefObject<string | null>;
  customer: { name: string; surname: string; email: string; phone: string; address: string };
  items: Array<{ productId: number; name: string; selectedColor?: string; selectedSize?: string; quantity: number }>;
  giftWrapping: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    payRef.current = async () => {
      if (!stripe || !elements) {
        return { ok: false, error: 'Mokėjimo sistema dar kraunasi' };
      }
      const resp = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customer.name,
          surname: customer.surname,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          orderId: orderIdRef?.current ?? undefined,
          items: items.map((it) => ({
            productId: it.productId,
            name: it.name,
            selectedColor: it.selectedColor ?? '',
            selectedSize: it.selectedSize ?? '',
            quantity: it.quantity
          })),
          giftWrapping
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        return { ok: false, error: err.error || resp.statusText };
      }
      const { clientSecret } = await resp.json();
      const card = elements.getElement(CardElement);
      const confirmation = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: { name: `${customer.name} ${customer.surname}`, email: customer.email }
        }
      } as any);
      if ((confirmation as any)?.error) {
        return { ok: false, error: (confirmation as any).error.message };
      }
      if (!confirmation?.paymentIntent || confirmation.paymentIntent.status !== 'succeeded') {
        return { ok: false, error: 'Mokėjimas nepatvirtintas' };
      }
      return { ok: true };
    };
    return () => { payRef.current = null; };
  }, [stripe, elements, payRef, orderIdRef, customer, items, giftWrapping]);

  return null;
}

export interface CheckoutStripeLoaderProps {
  payRef: React.MutableRefObject<null | (() => Promise<{ ok: boolean; error?: string }>)>;
  orderIdRef: React.MutableRefObject<string | null>;
  customer: { name: string; surname: string; email: string; phone: string; address: string };
  items: Array<{ productId: number; name: string; selectedColor?: string; selectedSize?: string; quantity: number }>;
  giftWrapping: boolean;
  /** Receives the Stripe card section to place inside the form */
  children: (card: React.ReactNode) => React.ReactNode;
}

export default function CheckoutStripeLoader({
  payRef,
  orderIdRef,
  customer,
  items,
  giftWrapping,
  children
}: CheckoutStripeLoaderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!STRIPE_PK) return;
    import('@stripe/stripe-js').then((m) => {
      setStripePromise(m.loadStripe(STRIPE_PK));
    });
  }, []);

  if (!STRIPE_PK) return null;

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-600">
        <span>Kraunama mokėjimo sistema...</span>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
      <StripePayBridge payRef={payRef} orderIdRef={orderIdRef} customer={customer} items={items} giftWrapping={giftWrapping} />
      {children(<StripeCardSection />)}
    </Elements>
  );
}
