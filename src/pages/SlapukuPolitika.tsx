import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function SlapukuPolitika() {
  return (
    <PageWrapper title="Slapukų politika">
      <div className="text-brand-muted space-y-4 font-medium">
        <p>
          Ši slapukų politika paaiškina, kaip Vasaros Kampelis naudoja slapukus ir panašias technologijas mūsų svetainėje. 
          Naudodamiesi mūsų svetaine, sutinkate su šia politika.
        </p>

        <h3 className="text-brand-blue-deep font-semibold text-lg">Kas yra slapukai?</h3>
        <p>
          Slapukai - tai maži tekstiniai failai, kurie išsaugomi jūsų įrenginyje (kompiuteryje, planšetėje ar išmaniajame telefone), 
          kai lankotės mūsų svetainėje. Jie padeda svetainei prisiminti jūsų nustatymus, pagerinti naršymo patirtį ir 
          surinkti anoniminę statistiką apie lankytojų elgesį.
        </p>

        <h3 className="text-brand-blue-deep font-semibold text-lg">Kokius slapukus naudojame</h3>
        <p>
          <strong>Būtini slapukai</strong> - būtini svetainės veikimui. Jie užtikrina pagrindines funkcijas: pirkinių krepšelį, 
          saugų prisijungimą, mokėjimų apdorojimą. Šių slapukų negalima išjungti.
        </p>
        <p>
          <strong>Funkciniai slapukai</strong> - prisimena jūsų pasirinkimus (pvz., kalbą, regioną) ir padeda personalizuoti 
          turinį bei pasiūlymus.
        </p>
        <p>
          <strong>Analitikos slapukai</strong> - padeda suprasti, kaip lankytojai naudoja svetainę (pvz., per „Google Analytics“). 
          Informacija renkama anonimiškai ir naudojama svetainės tobulinimui.
        </p>
        <p>
          <strong>Reklamos slapukai</strong> - gali būti naudojami rodant jums aktualias reklamas pagal jūsų interesus. 
          Šiuos slapukus galite valdyti per savo naršyklės nustatymus.
        </p>

        <h3 className="text-brand-blue-deep font-semibold text-lg">Kaip valdyti slapukus</h3>
        <p>
          Galite bet kada keisti savo slapukų nustatymus per naršyklės parametrus arba naudodami mūsų slapukų sutikimo 
          skydelį, kuris rodomas pirmą kartą apsilankius svetainėje. Atmesti neesminius slapukus gali paveikti 
          kai kurias svetainės funkcijas ir personalizaciją.
        </p>

        <h3 className="text-brand-blue-deep font-semibold text-lg">Trečiųjų šalių slapukai</h3>
        <p>
          Mūsų svetainėje gali būti naudojamos trečiųjų šalių paslaugos (pvz., mokėjimų apdorojimas per Stripe, 
          socialinių tinklų integracijos), kurios gali nustatyti savo slapukus. Šių paslaugų privatumo politikas 
          rekomenduojame peržiūrėti atitinkamose jų svetainėse.
        </p>

        <h3 className="text-brand-blue-deep font-semibold text-lg">Politikos atnaujinimai</h3>
        <p>
          Ši slapukų politika gali būti atnaujinama. Pakeitimai bus paskelbti šioje svetainėje su atnaujinta data. 
          Tęsdami naudotis svetaine po pakeitimų, sutinkate su atnaujinta politika.
        </p>

        <h3 className="text-brand-blue-deep font-semibold text-lg">Kontaktai</h3>
        <p>
          Klausimams ar pastaboms dėl slapukų politikos susisiekite su mumis el. paštu ar per socialinius tinklus - 
          kontaktus rasite <Link to="/kontaktai" className="text-brand-blue-deep underline">kontaktų skiltyje</Link>. 
          Daugiau informacijos apie asmens duomenų tvarkymą rasite mūsų{' '}
          <Link to="/privatumo-politika" className="text-brand-blue-deep underline">privatumo politikoje</Link>.
        </p>
      </div>
    </PageWrapper>
  );
}
