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
      <table className="w-full min-w-0 overflow-hidden text-left font-['Plus_Jakarta_Sans',system-ui,sans-serif] antialiased tracking-tight max-md:table-fixed md:min-w-[340px] lg:min-w-[480px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 sm:py-3 sm:text-sm"
            >
              Charakteristika
            </th>
            <th
              scope="col"
              className="max-md:w-[50px] max-md:min-w-[50px] max-md:max-w-[50px] max-md:p-1 px-3 py-3 text-center text-sm font-extrabold uppercase leading-snug tracking-wide text-primary sm:p-4 sm:text-base"
            >
              <span className="hidden md:inline">{BRAND.nameShort}</span>
              <span className="flex flex-col items-center gap-0.5 md:hidden">
                {BRAND.nameShort.split(/\s+/).map((word) => (
                  <span key={word} className="text-[10px] font-extrabold uppercase leading-none text-primary">
                    {word}
                  </span>
                ))}
              </span>
            </th>
            <th
              scope="col"
              className="max-md:w-[50px] max-md:min-w-[50px] max-md:max-w-[50px] max-md:p-1 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-700 sm:px-4 sm:py-3 sm:text-sm"
            >
              {otherLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border bg-surface last:border-b-0 hover:bg-bg/40">
              <td className="px-4 py-3 text-sm font-semibold text-text max-md:min-w-0 sm:p-4 sm:text-base">{row.feature}</td>
              <td className="bg-surface px-3 py-3 text-center sm:p-4 max-md:w-[50px] max-md:min-w-[50px] max-md:max-w-[50px] max-md:px-1">
                <span className="inline-flex items-center justify-center" aria-label={row.us ? 'Taip' : 'Ne'} role="img">
                  {row.us ? (
                    <Check className="h-6 w-6 text-success sm:h-7 sm:w-7" strokeWidth={2.35} aria-hidden />
                  ) : (
                    <X className="h-6 w-6 text-muted" strokeWidth={1.65} aria-hidden />
                  )}
                </span>
              </td>
              <td className="bg-surface px-3 py-3 text-center sm:p-4 max-md:w-[50px] max-md:min-w-[50px] max-md:max-w-[50px] max-md:px-1">
                <span className="inline-flex items-center justify-center" aria-label={row.cheap ? 'Taip' : 'Ne'} role="img">
                  {row.cheap ? (
                    <Check className="h-6 w-6 text-success sm:h-7 sm:w-7" strokeWidth={2.35} aria-hidden />
                  ) : (
                    <X className="h-[1.375rem] w-[1.375rem] text-slate-400 sm:h-[1.375rem] sm:w-[1.375rem]" strokeWidth={1.35} aria-hidden />
                  )}
                </span>
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
        <h2 className="mb-8 text-center text-h2 font-bold text-text antialiased font-['Plus_Jakarta_Sans',system-ui,sans-serif] tracking-tight sm:text-h2-lg">
          Kodėl ne pigūs vandens pistoletai?
        </h2>
        {content}
      </div>
    </section>
  );
}
