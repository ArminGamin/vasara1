import React from 'react';
import { ShoppingCart, CreditCard, Truck } from 'lucide-react';

type Lang = 'lt' | 'en';

interface WhyChooseUsProps {
  language: Lang;
}

const COPY: Record<
  Lang,
  { title: string; sub: string; steps: { title: string; body: string }[] }
> = {
  lt: {
    title: 'Paprasta pirkimo eiga',
    sub: 'Trys aiškūs žingsniai nuo krepšelio iki pristatymo! 🚚',
    steps: [
      {
        title: 'Greitas ir paprastas pasirinkimas',
        body: 'Raskite tinkamą variantą sau vos per kelias minutes.',
      },
      {
        title: 'Greitas ir saugus mokėjimas',
        body: 'Apmokėkite patogiai banko kortele ir iškart gaukite užsakymo patvirtinimą.',
      },
      {
        title: 'Pristatymas iki durų',
        body: 'Siunčiame visoje Lietuvoje ir informuojame apie kiekvieną užsakymo etapą.',
      },
    ],
  },
  en: {
    title: 'Simple purchase flow',
    sub: 'Three clear steps from cart to delivery! 🚚',
    steps: [
      {
        title: 'Fast, simple picks',
        body: 'Find the right variant in minutes.',
      },
      {
        title: 'Fast, secure checkout',
        body: 'Pay by card via a secure session and get confirmation right after payment.',
      },
      {
        title: 'Delivery to your door',
        body: 'We ship across Lithuania with tracking updates so you know when your parcel arrives.',
      },
    ],
  },
};

const ICONS = [ShoppingCart, CreditCard, Truck] as const;

export function WhyChooseUs({ language }: WhyChooseUsProps) {
  const c = COPY[language];
  return (
    <section className="overflow-visible border-y border-border/80 bg-bg/80 px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="revo-section-title revo-section-title-sm mb-1.5 text-center">{c.title}</h2>
        <p className="revo-section-sub text-center mb-8 md:mb-10">{c.sub}</p>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {c.steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={step.title}
                className="relative flex flex-col items-center rounded-[1.25rem] border border-border bg-surface px-5 pb-8 pt-7 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 flex justify-center">
                  <Icon
                    className="h-10 w-10 shrink-0 text-primary"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  />
                </div>
                <h3 className="mb-2 text-lg font-extrabold tracking-tight text-text md:text-xl">{step.title}</h3>
                <p className="max-w-[22rem] text-center text-[0.9375rem] leading-relaxed font-medium text-muted">{step.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
