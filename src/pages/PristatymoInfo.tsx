import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function PristatymoInfo() {
  return (
    <PageWrapper title="Pristatymo informacija" description="Pristatymas į visą Lietuvą per 4–6 dienas. Nemokamas pristatymas nuo 80€. Užsakymams iki 80€ – 2,99€.">
      <div className="space-y-4 text-brand-muted font-medium">
        <p>
          Įprastai užsakymus pristatome per 4–6 dienas, priklausomai nuo užsakymo kiekio, prekės tiekėjo sandėlio lokacijos ir pristatymo vietos.
        </p>
        <p>
          Kadangi bendradarbiaujame su tarptautiniais tiekėjais, dalis prekių gali būti siunčiama iš užsienio sandėlių, todėl jų pristatymas į Lietuvą tam tikrais atvejais gali užtrukti ilgiau.
        </p>
        <p>
          Didesnio užimtumo laikotarpiais, esant padidėjusiam užsakymų kiekiui, tiekėjų ar kurjerių apkrovai, pristatymas gali užtrukti iki 16 dienų.
        </p>
        <p>
          Dedame visas pastangas, kad prekės klientus pasiektų kuo greičiau. Pateikdamas užsakymą klientas patvirtina, kad susipažino su pristatymo informacija ir supranta, jog pristatymo terminas gali priklausyti nuo tiekėjų, kurjerių bei užsakymų srauto.
        </p>
        <p>
          Užsakymams virš 80 € taikomas nemokamas pristatymas.
        </p>
      </div>
    </PageWrapper>
  );
}
