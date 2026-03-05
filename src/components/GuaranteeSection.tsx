import React from 'react';
import { Shield } from 'lucide-react';

export function GuaranteeSection() {
  return (
    <section className="py-8 md:py-10 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-3">
          <Shield className="w-8 h-8 text-success" aria-hidden />
        </div>
        <h2 className="text-h2 sm:text-h2-lg font-bold text-text mb-2">
          30 dienų garantija
        </h2>
        <p className="text-text font-semibold max-w-xl mx-auto">
          Nesitenkinote? Grąžiname pinigus be klausimų per 30 dienų. Pirkite drąsiai.
        </p>
      </div>
    </section>
  );
}
