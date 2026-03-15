import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function PrivatumoPolitika() {
  return (
    <PageWrapper title="Privatumo Politika">
      <div className="text-brand-muted space-y-4 font-medium">
        <p>Mes renkame informaciją iš klientų, kai jie atlieka pirkimą arba užsiprenumeruoja naujienlaiškį. Ši informacija gali apimti jūsų vardą, el. pašto adresą, pašto adresą ir mokėjimo informaciją. Taip pat galime rinkti informaciją apie jūsų pageidavimus ir produktus, kuriuos įsigyjate mūsų parduotuvėje.</p>
        <h3 className="text-brand-blue-deep font-semibold text-lg">Informacijos naudojimas</h3>
        <p>Surinktą informaciją naudojame užsakymų apdorojimui, klientų aptarnavimui ir apsipirkimo patirčiai mūsų svetainėje gerinti. Jūsų el. pašto adresas gali būti naudojamas naujienoms, pasiūlymams ar akcijoms siųsti. Galite bet kada atsisakyti šių pranešimų.</p>
        <h3 className="text-brand-blue-deep font-semibold text-lg">Informacijos bendrinimas</h3>
        <p>Asmeninė informacija nėra parduodama, nuomojama ar kitaip perduodama trečiosioms šalims, išskyrus atvejus, kai tai būtina užsakymui įvykdyti, laikantis įstatymų reikalavimų arba siekiant apsaugoti mūsų teises.</p>
        <h3 className="text-brand-blue-deep font-semibold text-lg">Saugumas</h3>
        <p>Mes rimtai žiūrime į asmeninės informacijos apsaugą ir taikome tinkamas technines bei organizacines priemones, siekiant apsaugoti ją nuo neteisėtos prieigos, praradimo ar paviešinimo. Mokėjimai atliekami per saugius serverius, o klientų duomenys saugomi apsaugotoje duomenų bazėje.</p>
        <h3 className="text-brand-blue-deep font-semibold text-lg">Privatumo politikos pakeitimai</h3>
        <p>Ši privatumo politika gali būti atnaujinama be išankstinio įspėjimo. Atnaujinta versija visada bus pateikta šioje svetainėje ir įsigalios nuo paskelbimo momento.</p>
        <h3 className="text-brand-blue-deep font-semibold text-lg">Kontaktai</h3>
        <p>Kilus klausimams ar pastebėjimams dėl šios privatumo politikos, susisiekite su mumis el. paštu ar per socialinius tinklus - kontaktus rasite <Link to="/kontaktai" className="text-brand-blue-deep underline">kontaktų skiltyje</Link>.</p>
      </div>
    </PageWrapper>
  );
}
