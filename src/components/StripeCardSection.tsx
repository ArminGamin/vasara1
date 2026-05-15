import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';

export default function StripeCardSection(): JSX.Element {
  const lift =
    'rounded-xl border border-slate-200/95 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_10px_28px_rgba(15,23,42,0.07)]';
  const sslBand =
    'flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-1 rounded-xl border border-slate-200/95 bg-white p-3 text-xs text-gray-700 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_10px_28px_rgba(15,23,42,0.07)]';
  return (
    <div className="space-y-3">
      <div className={lift}>
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <div className={sslBand}>
        <span className="font-semibold text-gray-800">256-bit SSL Secure Checkout</span>
        <span className="text-gray-600">Jūsų mokėjimo informacija yra visiškai saugi</span>
      </div>
    </div>
  );
}


