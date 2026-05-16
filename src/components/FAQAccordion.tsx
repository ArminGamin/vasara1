import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { BRAND } from '../config/brand';

const faqs = [
  {
    q: 'Ar prekės saugios vaikams?',
    a: 'Taip. Mūsų vandens ginklai sukurti smagiam ir saugiam žaidimui lauke - be pavojingų elementų, tik linksmi vasaros nuotykiai.',
  },
  {
    q: 'Kokio amžiaus vaikams tinka?',
    a: 'Tinka vaikams nuo 5 metų. Mažesniems vaikams rekomenduojama naudoti prižiūrint suaugusiesiems.',
  },
  {
    q: 'Kiek laiko trunka pristatymas?',
    a: 'Įprastai užsakymą pristatome per 5–7 darbo dienų, priklausomai nuo užsakymo kiekio ir pristatymo vietos. Dedame visas pastangas, kad prekė jus pasiektų kuo greičiau. Didesnio užimtumo laikotarpiais pristatymas gali užtrukti šiek tiek ilgiau. Užsakymams virš 80€ - nemokamas pristatymas.',
  },
  {
    q: 'Kokie mokėjimo būdai?',
    a: 'Priimame Visa ir Mastercard. Visi mokėjimai apdorojami per saugius mokėjimų tiekėjus.',
  },
] as const;

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="pt-6 md:pt-8 pb-8 md:pb-10 lg:pb-12 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start">
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col text-left max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta mb-2">
              Pagalba
            </p>
            <h2 className="text-2xl sm:text-3xl xl:text-[2rem] font-bold text-text leading-tight mb-3">
              Dažniausiai užduodami klausimai
            </h2>
            <p className="text-base text-muted font-normal leading-relaxed mb-5 md:mb-6">
              Neradote atsakymo? Susisiekite ir atsakysime greitai.
            </p>
            <a
              href={`mailto:${BRAND.email}`}
              className="group flex gap-3 rounded-2xl bg-surface p-3 md:p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_6px_16px_rgba(0,0,0,0.07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                <Mail className="h-5 w-5 text-text" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex flex-col justify-center text-left gap-0.5">
                <span className="text-sm font-semibold text-text">Rašykite mums</span>
                <span className="text-sm text-muted break-all">{BRAND.email}</span>
              </span>
            </a>
          </div>
          <div className="lg:col-span-7 xl:col-span-8 space-y-3 md:space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className={
                    isOpen
                      ? 'rounded-2xl border border-primary overflow-hidden bg-primary/[0.02] shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_8px_rgba(0,0,0,0.04)]'
                      : 'bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.1),0_1px_4px_rgba(15,23,42,0.06)]'
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className={`w-full text-left px-4 md:px-6 py-3 font-semibold text-text flex justify-between items-center gap-4 transition min-h-[52px] ${
                      isOpen ? 'hover:bg-primary/[0.03]' : 'hover:bg-slate-50'
                    }`}
                    aria-expanded={isOpen}
                  >
                    {faq.q}
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${
                        isOpen
                          ? 'bg-primary/30 text-primaryDark'
                          : 'bg-primary/20 text-primaryDark'
                      }`}
                      aria-hidden
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <>
                      <div
                        className="mx-4 md:mx-6 h-px shrink-0 bg-slate-200"
                        aria-hidden
                      />
                      <div className="bg-transparent pt-4 pb-5 pl-5 pr-5 md:pt-5 md:pb-6 md:pl-6 md:pr-6">
                        <p className="border-l-[3px] border-primary pl-5 md:pl-6 pr-1 text-[15px] font-normal leading-[1.6] text-[#4B5563]">
                          {faq.a}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
