import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function PristatymoInfo() {
  return (
    <PageWrapper title="Pristatymo informacija" description="Pristatymas į visą Lietuvą per 8–12 darbo dienų. Nemokamas pristatymas nuo 80€. Užsakymams iki 80€ – 2,99€.">
      <p className="text-brand-muted font-medium">
        Įprastai užsakymą pristatome per 8–12 darbo dienų, priklausomai nuo užsakymo kiekio ir pristatymo vietos. Dedame visas pastangas, kad prekė jus pasiektų kuo greičiau. Didesnio užimtumo laikotarpiais pristatymas gali užtrukti šiek tiek ilgiau. Užsakymams virš 80€ - nemokamas pristatymas.
      </p>
    </PageWrapper>
  );
}
