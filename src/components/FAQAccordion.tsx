import React, { useState } from 'react';

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
    a: 'Įprastai užsakymą pristatome per 8–12 darbo dienų, priklausomai nuo užsakymo kiekio ir pristatymo vietos. Dedame visas pastangas, kad prekė jus pasiektų kuo greičiau. Didesnio užimtumo laikotarpiais pristatymas gali užtrukti šiek tiek ilgiau. Užsakymams virš 80€ - nemokamas pristatymas.',
  },
  {
    q: 'Kokie mokėjimo būdai?',
    a: 'Priimame Visa ir Mastercard. Visi mokėjimai apdorojami per saugius mokėjimų tiekėjus.',
  },
] as const;

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="py-6 md:py-10 bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-h2 sm:text-h2-lg font-bold text-text text-center mb-6">
          Dažniausiai užduodami klausimai
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-4 md:px-6 py-4 font-semibold text-text flex justify-between items-center gap-4 hover:bg-promoBg/30 transition min-h-[56px]"
                aria-expanded={openIndex === i}
              >
                {faq.q}
                <span className="flex-shrink-0 text-primary">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-4 md:px-6 pb-4 text-muted text-sm font-medium border-t border-border">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
