import React from 'react';
import { Check, X } from 'lucide-react';
import { BRAND } from '../config/brand';

const rows = [
  { feature: 'Kokybė / atsparumas', us: true, cheap: false },
  { feature: 'Didelė vandens talpa', us: true, cheap: false },
  { feature: 'Pilnai automatinis režimas', us: true, cheap: false },
  { feature: 'Lengvas taktinio stiliaus dizainas', us: true, cheap: false },
  { feature: 'Šaudo iki 10 metrų atstumu', us: true, cheap: false },
  { feature: 'Stabilus ir patogus laikymas', us: true, cheap: false },
];

type ComparisonTableProps = {
  /** When true, render only the table (no section wrapper, no heading) for embedding in Pillow-style Why section */
  embedded?: boolean;
  /** Label for the "others" column when embedded (e.g. "Kiti") */
  otherLabel?: string;
};

export function ComparisonTable({ embedded = false, otherLabel = 'Pigūs pistoletai' }: ComparisonTableProps) {
  const content = (
    <div className={embedded ? 'pillow-comparison-box overflow-x-auto' : 'overflow-x-auto rounded-2xl border border-border shadow-sm bg-surface'}>
      <table className="w-full text-left min-w-[340px]">
        <thead>
          <tr className="border-b border-border bg-bg">
            <th className="px-3 py-3 sm:p-4 font-semibold text-text text-sm sm:text-base">Charakteristika</th>
            <th className="px-3 py-3 sm:p-4 font-semibold text-text bg-promoBg text-center text-sm sm:text-base">{BRAND.nameShort}</th>
            <th className="px-3 py-3 sm:p-4 font-semibold text-muted text-center text-sm sm:text-base">{otherLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border hover:bg-bg/50">
              <td className="px-3 py-3 sm:p-4 font-semibold text-text text-sm sm:text-base">{row.feature}</td>
              <td className="px-3 py-3 sm:p-4 bg-promoBg text-center">
                {row.us ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-success inline-block" aria-hidden />
                ) : (
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-border inline-block" aria-hidden />
                )}
              </td>
              <td className="px-3 py-3 sm:p-4 text-center">
                {row.cheap ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-muted inline-block" aria-hidden />
                ) : (
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 inline-block" aria-hidden />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="py-12 md:py-16 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-h2 sm:text-h2-lg font-bold text-text text-center mb-8">
          Kodėl ne pigūs vandens pistoletai?
        </h2>
        {content}
      </div>
    </section>
  );
}
