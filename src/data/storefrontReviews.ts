export interface StorefrontReview {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

export const STOREFRONT_REVIEWS: StorefrontReview[] = [
  { name: 'Elena S.', location: 'Vilnius', rating: 5, text: 'Nupirkome pradžiai vieną, bet greitai teko užsakyti dar 😉', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop&q=80' },
  { name: 'Mantas K.', location: 'Kaunas', rating: 5, text: 'Visai bomba 🔥 su draugais vasarą tikrai bus veiksmo', image: '/mantas1-88w.webp' },
  { name: 'Rūta L.', location: 'Klaipėda', rating: 5, text: 'Realiai nesitikėjau, kad bus toks smagus dalykas 😂 su draugais išbandėm ir užsikabinom 😂', image: '/ruta1-88w.webp' },
  { name: 'Jonas P.', location: 'Šiauliai', rating: 4, text: 'Viskas veikia gerai, tik baterija galėtų laikyti šiek tiek ilgiau.', image: '/jonas1-88w.webp' },
  { name: 'Laura M.', location: 'Kaunas', rating: 5, text: 'Pirkau dovanai sūnėnui jo reakcija buvo geriausia dalis 😄 Žaidžia beveik kasdien. Dizainas gražus, atrodo kokybiškai.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80' },
  { name: 'Tomas V.', location: 'Alytus', rating: 5, text: 'Vandens mūšiai kieme tapo kasdienybe. Šaudo tikrai toli, o talpa didesnė nei tikėjausi.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&q=80' },
  { name: 'Giedrė J.', location: 'Vilnius', rating: 5, text: 'Draugė rekomendavo, tai nusprendėm išbandyti. Nenusivylėm. Naudojam jau antrą mėnesį - vis dar kaip naujas! 😊', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&q=80' },
  { name: 'Andrius R.', location: 'Vilnius', rating: 5, text: 'Pirkau sūnui, bet pats išbandžiau pirmas 😄 Šaudo gerai, atrodo kokybiškai. Kol kas jokių nusiskundimų.', image: '/andrius3-88w.webp' },
];

export const REVIEW_IMAGE_FALLBACK: Record<string, string> = {
  '/mantas1-88w.webp': '/mantas1.jpg',
  '/ruta1-88w.webp': '/ruta1.jpg',
  '/jonas1-88w.webp': '/jonas1.jpg',
  '/andrius3-88w.webp': '/andrius3.jpg',
};
