import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'Elena S.', location: 'Vilnius', rating: 5, text: 'Nupirkome pradžiai vieną, bet greitai teko užsakyti dar 😉', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop&q=80' },
  { name: 'Mantas K.', location: 'Kaunas', rating: 5, text: 'Visai bomba 🔥 su draugais vasarą tikrai bus veiksmo', image: '/mantas1.jpg' },
  { name: 'Rūta L.', location: 'Klaipėda', rating: 5, text: 'Realiai nesitikėjau, kad bus toks smagus dalykas 😂 su draugais išbandėm ir užsikabinom 😂', image: '/ruta1.jpg' },
  { name: 'Jonas P.', location: 'Šiauliai', rating: 4, text: 'Viskas veikia gerai, tik baterija galėtų laikyti šiek tiek ilgiau.', image: '/jonas1.jpg' },
  { name: 'Laura M.', location: 'Kaunas', rating: 5, text: 'Pirkau dovanai sūnėnui jo reakcija buvo geriausia dalis 😄 Žaidžia beveik kasdien. Dizainas gražus, atrodo kokybiškai.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80' },
  { name: 'Tomas V.', location: 'Alytus', rating: 5, text: 'Vandens mūšiai kieme tapo kasdienybe. Šaudo tikrai toli, o talpa didesnė nei tikėjausi.', image: '/tomas2.png' },
  { name: 'Giedrė J.', location: 'Vilnius', rating: 5, text: 'Draugė rekomendavo, tai nusprendėm išbandyti. Nenusivylėm. Naudojam jau antrą mėnesį - vis dar kaip naujas! 😊', image: '/giedre1.png' },
  { name: 'Andrius R.', location: 'Vilnius', rating: 5, text: 'Pirkau sūnui, bet pats išbandžiau pirmas 😄 Šaudo gerai, atrodo kokybiškai. Kol kas jokių nusiskundimų.', image: '/andrius3.jpg' },
];

function ReviewCard({ r }: { r: (typeof reviews)[0] }) {
  return (
    <div className="revo-review-card">
      <div className="flex items-center gap-3">
        <img src={r.image} alt="" className="w-11 h-11 rounded-full object-cover" loading="lazy" decoding="async" />
        <div>
          <p className="font-semibold text-text">{r.name}</p>
          <p className="text-sm text-muted">{r.location}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mt-2" aria-label={`${r.rating} iš 5`}>
        {[...Array(5)].map((_, j) => (
          <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'text-cta fill-cta' : 'text-border'}`} />
        ))}
      </div>
      <p className="revo-review-text">{r.text}</p>
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-6 md:py-10 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="revo-section-title text-center mb-2">Ką sako klientai</h2>
        <p className="revo-section-sub text-center font-semibold text-text">Tikri atsiliepimai! ✅</p>
      </div>
      {/* Full-width marquee so it fills edge-to-edge */}
      <div className="revo-reviews-marquee-wrap" aria-label="Atsiliepimų slinktis">
        <div className="revo-reviews-marquee">
          <div className="revo-reviews-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="revo-reviews-set" aria-hidden={copy > 0}>
                {reviews.map((r, i) => (
                  <ReviewCard key={`${copy}-${i}`} r={r} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
