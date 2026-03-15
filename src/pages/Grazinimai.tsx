import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function Grazinimai() {
  return (
    <PageWrapper title="Grąžinimai" description="Grąžinimų politika. Visi pardavimai galutiniai. Susisiekite prieš pirkdami – mielai padėsime.">
      <div className="text-brand-muted space-y-4 font-medium">
        <p>
          Norime, kad būtumėte visiškai patenkinti savo pirkiniu! Atkreipkite dėmesį, kad visi pardavimai yra galutiniai, todėl grąžinti ar pakeisti prekių negalime. Raginame atidžiai peržiūrėti prekės aprašymą ir nuotraukas prieš pateikiant užsakymą. Jei turite klausimų arba reikia pagalbos renkantis tinkamą prekę, mūsų komanda mielai jums padės - <Link to="/kontaktai" className="text-brand-blue-deep underline">susisiekite</Link> dar prieš pirkdami! 🤝
        </p>
      </div>
    </PageWrapper>
  );
}
