import React from 'react';
import { Lock, ShieldCheck, CreditCard } from 'lucide-react';

export function TrustBadges() {
  return (
    <section className="py-8 md:py-10 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 text-text">
            <Lock className="w-5 h-5 flex-shrink-0" aria-hidden />
            <span className="text-sm font-semibold">SSL šifruota sesija</span>
          </div>
          <div className="flex items-center gap-2 text-text">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" aria-hidden />
            <span className="text-sm font-semibold">Saugus mokėjimas</span>
          </div>
          <div className="flex items-center gap-2 text-text">
            <CreditCard className="w-5 h-5 flex-shrink-0" aria-hidden />
            <span className="text-sm font-semibold">Visa, Mastercard</span>
          </div>
          <img
            src="/mastercard.svg"
            alt="Mastercard"
            width={34}
            height={24}
            className="h-6 opacity-70 object-contain"
            loading="lazy"
            decoding="async"
          />
          <div className="bg-surface border border-border px-2 py-1 rounded">
            <span className="text-primary font-bold text-xs">VISA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
