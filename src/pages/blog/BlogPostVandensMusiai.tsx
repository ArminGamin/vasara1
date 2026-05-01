import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { BLOG_PUBLISHED, BLOG_DESCRIPTION, BLOG_MODIFIED } from '../../data/blogMeta';

export default function BlogPostVandensMusiai() {
  return (
    <PageWrapper
      title="Vandens Mūšių Organizavimas: Kaip Surengti Nepamirštamą Vasaros Dieną"
      bannerTitle={
        <>
          <span aria-hidden="true">🎯 </span>
          Vandens Mūšių Organizavimas: Kaip Surengti Nepamirštamą Vasaros Dieną
        </>
      }
      publishedAt={BLOG_PUBLISHED.vandensMusiai}
      modifiedAt={BLOG_MODIFIED.vandensMusiai}
      ogImage="/hero-blue-ar.webp"
      description={BLOG_DESCRIPTION.vandensMusiai}
      wordCount={290}
      keywords="vandens mūšis, vandens žaidimų organizavimas, vandens šautuvai, vasaros šventė kieme, šeimos žaidimai lauke, saugumas vaikams"
      relatedPostPaths={[
        '/blog/vandens-zaidimai-vaikams',
        '/blog/kaip-issirinkti-vandens-blasteri',
        '/blog/10-paprastu-budu-megautis-vasara-lauke',
      ]}
    >
      <article className="prose prose-lg max-w-none">
        <p>Vandens mūšis kieme ar parke – vienas geriausių būdų praleisti vasaros dieną su šeima ir draugais. Nesėkmės dažniausiai kyla ne nuo trūkstamo inventoriaus, o nuo miglotų taisyklių ir per ilgo žaidimo be pertraukų. Žemiau – kaip struktūruoti vakarą taip, kad ir penkiamečiai, ir suaugusieji jaustųsi įtraukti.</p>

        <h3>🎯 1. Vieta ir Laikas</h3>
        <p>Rinkitės zoną netoli vandens šaltinio (čiaupo, iš anksto užpiltų kibirų). Stiprios saulės valandomis rinkitės vietą bent dalinai šesėlyje po medžiu ar su skėčiu prie stebėjimo zonos ir gėrimų. Jei kiemas mažas – suplanuokite trumpesnius raundus ir rotaciją, kad visi nebūtų tame pačiame kampelyje.</p>

        <h3>👥 2. Komandos ir Taisyklės</h3>
        <p>Užtenka dviejų aiškių komandų arba formato „kiekvienas už save“ su sąžiningais refill taškais. Prieš startą būtinai trijų punktų taisyklės: ne taikyti į veidus ir akis; sustabdymo žodis („stop“) visiems privalomas; slidžios zonos prie čiaupo – tik su basutėmis arba prie suaugusių priežiūros.</p>

        <h3>💦 3. Blasteriai ir Įranga</h3>
        <p>Jei komanda dvi – stenkitės, kad abiejose būtų panaši pagal klasę įranga (<Link to="/p/1001" className="text-blue-600 hover:underline">užsukite į vitriną</Link> vienoje vietoje palygintuvui). Papildykite kibirą ar baseinėlį refill tarp raundų, švarius rankšluosčius ir sausa vieta telefonų / raktų dėžių.</p>

        <h3>🛡️ 4. Saugumas</h3>
        <p>Jokių kietų daiktų vandenyje kartu – tik purškimas ir balionai. Mažus vaikus laikykite matomoje zonoje; atkreipkite dėmesį į paviras grindis ant terasų. Kiekviena intensyvių purslų pusvalandį – oficiali pertrauka vandeniui iš butelių šešėlyje.</p>

        <h3>🏆 5. Pabaiga dienos</h3>
        <p>Po žaidimo – aiškiai paskelbta pabaiga, ne „išsekimas prie kovos“. Ledai ar gaivinančios užkandės, laikinas džiovimas antklode, nuotraukų momentas. Jei planuojate dovanėlę nugalėtojams, rinkitės nedidelę ir susijusią – pvz., papildomą prieš kitą kartą tinkantį aksesuarą prie vandens žaidimo.</p>

        <h3>🌟 Apibendrinimas</h3>
        <p>Gerai suplanuotas mūšis – paprastas, saugus ir trumpas kiekviename raunde. Inventoriui ir atnaujinimams <Link to="/#products" className="text-blue-600 hover:underline">Vasaros Kampelio puslapyje</Link> rasite vandens šautuvus ir rinkinius vienoje vietoje – palengvins pakaitomis naudoti visai grupėje.</p>
      </article>
    </PageWrapper>
  );
}
