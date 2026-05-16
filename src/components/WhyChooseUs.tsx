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
    sub: 'Trys aiškūs žingsniai nuo krepšelio iki pristatymo',
    steps: [
      {
        title: 'Išsirinkite prekes',
        body: 'Įdėkite modelius į krepšelį ir patikrinkite kiekį – rodome likutį ir pagrindinius skirtumus vienoje vietoje.',
      },
      {
        title: 'Greitas ir saugus mokėjimas',
        body: 'Atsiskaitykite banko kortele per saugią mokėjimo sesiją ir gaukite patvirtinimą iškart po apmokėjimo.',
      },
      {
        title: 'Pristatymas iki durų',
        body: 'Siunčiame Lietuvoje pasirinktu būdu ir pranešame apie eigą – kad žinotumėte, kada siunta bus pas jus.',
      },
    ],
  },
  en: {
    title: 'Simple purchase flow',
    sub: 'Three clear steps from cart to delivery',
    steps: [
      {
        title: 'Pick your gear',
        body: 'Add models to cart and verify quantities—we show availability and core differences in one place.',
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
    <section className="border-y border-border/80 bg-bg/80 px-4 py-8 backdrop-blur-[2px] sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-1.5 text-center text-2xl font-extrabold tracking-tight text-text md:text-[1.75rem]">
          {c.title}
        </h2>
        <p className="mb-8 text-center text-sm font-semibold text-muted md:mb-10 md:text-[0.9375rem]">{c.sub}</p>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {c.steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={step.title}
                className="relative flex flex-col items-center rounded-[1.25rem] border border-border bg-surface px-5 pb-8 pt-7 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 flex flex-col items-center gap-4">
                  <div
                    className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-primary px-3 text-[0.8125rem] font-black tabular-nums text-white shadow-sm"
                    aria-hidden
                  >
                    {i + 1}
                  </div>
                  <Icon
                    className="h-9 w-9 shrink-0 text-primary"
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
