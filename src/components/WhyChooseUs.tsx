import React from 'react';
import { Truck, Shield, RotateCcw } from 'lucide-react';

const items = [
  { icon: Truck, title: 'Nemokamas pristatymas', text: 'Užsakymams virš 80€ – pristatome į visą Lietuvą.' },
  { icon: Shield, title: '30 dienų grąžinimas', text: 'Nesitenkinote? Grąžiname pinigus be papildomų mokesčių.' },
  { icon: RotateCcw, title: 'Kokybė, kuri laiko', text: 'Tvirti, saugūs ir patikimi – tinka šeimai ir draugams.' },
];

export function WhyChooseUs() {
  return (
    <section className="py-12 md:py-16 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="revo-section-title text-center mb-2">Kodėl rinktis mus</h2>
        <p className="revo-section-sub text-center mb-10">Greitas pristatymas, saugus mokėjimas, 30 dienų garantija</p>
        <div className="revo-why-grid">
          {items.map((Item, i) => (
            <div key={i} className="revo-why-card">
              <div className="revo-why-icon">
                <Item.icon className="w-6 h-6" aria-hidden />
              </div>
              <h3 className="revo-why-title">{Item.title}</h3>
              <p className="revo-why-text">{Item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
