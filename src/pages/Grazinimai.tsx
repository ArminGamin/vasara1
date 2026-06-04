import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function Grazinimai() {
  return (
    <PageWrapper title="Grąžinimai" description="Grąžinimų politika. Kokybiškos prekės grąžinamos per 14 dienų. Susisiekite dėl pažeidimų transportavimo metu.">
      <div className="text-brand-muted space-y-4 font-medium">
        <p>
          Norime, kad būtumėte visiškai patenkinti savo pirkiniu, todėl prieš pateikiant užsakymą rekomenduojame atidžiai peržiūrėti prekės aprašymą, nuotraukas, spalvą, tipą ir kitą pateiktą informaciją.
        </p>
        <p>
          Kokybiškos prekės gali būti grąžinamos per 14 dienų nuo prekės gavimo dienos, jeigu prekė nebuvo naudota, nėra sugadinta, nepraradusi prekinės išvaizdos, yra švari, su originalia pakuote bei visais komplekte buvusiais priedais.
        </p>
        <p>
          Atkreipiame dėmesį, kad prekės, kurios buvo naudotos, pripildytos vandeniu, mechaniškai pažeistos, subraižytos, sulaužytos, suteptos ar kitaip praradusios prekinę išvaizdą, nėra priimamos kaip kokybiškos prekės grąžinimas.
        </p>
        <p>
          Gavus siuntą, prašome ją apžiūrėti pristatymo metu. Jeigu pastebite pažeistą pakuotę, įlenkimus, plyšimus ar kitus galimus transportavimo pažeidimus, rekomenduojame tai užfiksuoti nuotraukomis ir, jei įmanoma, pažymėti kurjeriui arba siuntų tarnybai.
        </p>
        <p>
          Jeigu prekė buvo pažeista transportavimo metu, prašome susisiekti su mumis kuo greičiau po siuntos gavimo ir pateikti prekės nuotraukas, pakuotės nuotraukas, užsakymo numerį bei trumpą situacijos aprašymą.
        </p>
        <p>
          Kiekvieną situaciją vertiname individualiai pagal pateiktą informaciją ir įrodymus. Jeigu prekė buvo priimta be pastabų, o apie pažeidimus pranešama vėliau, gali būti sudėtinga nustatyti, ar pažeidimas atsirado transportavimo metu, ar po prekės gavimo.
        </p>
        <p>
          Priėmus siuntą ir pradėjus naudoti prekę, atsakomybė už vėliau atsiradusius mechaninius pažeidimus tenka pirkėjui, nebent įrodoma, kad prekė buvo pažeista arba brokuota dar iki jos perdavimo pirkėjui.
        </p>
        <p>
          Už pažeidimus, atsiradusius dėl netinkamo prekės naudojimo, neatsargaus elgesio, kritimo, smūgių, netinkamo surinkimo ar kitų nuo pardavėjo nepriklausančių veiksmų po prekės gavimo, pardavėjas neatsako.
        </p>
        <p>
          Jeigu prekė grąžinama dėl pirkėjo apsisprendimo, grąžinimo siuntimo išlaidas apmoka pirkėjas. Grąžinama prekė turi būti saugiai supakuota, kad transportavimo metu nebūtų pažeista.
        </p>
        <p>
          Pinigai grąžinami po to, kai prekė grąžinama ir patikrinama jos būklė.
        </p>
        <p>
          Jeigu turite klausimų prieš perkant arba reikia pagalbos renkantis tinkamą prekę, mūsų komanda mielai jums padės — <Link to="/kontaktai" className="text-brand-blue-deep underline">susisiekite</Link> dar prieš pateikdami užsakymą. 🤝
        </p>
      </div>
    </PageWrapper>
  );
}
