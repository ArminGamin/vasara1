import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { BLOG_PUBLISHED, BLOG_DESCRIPTION } from '../../data/blogMeta';

export default function BlogPostPiknikoIdejos() {
  return (
    <PageWrapper
      title="Pikniko Idėjos Vasarai: Ko Nepasimiršti"
      bannerTitle={
        <>
          <span aria-hidden="true">🧺 </span>
          Pikniko Idėjos Vasarai: Ko Nepasimiršti
        </>
      }
      publishedAt={BLOG_PUBLISHED.pikniko}
      description={BLOG_DESCRIPTION.pikniko}
    >
      <article className="prose prose-lg max-w-none">
        <p>Piknikas parke, ežero pakrantėje ar savo kieme veikia gerai tada, kai iš anksto pagalvota ne tik apie padėklą su užkandomis, bet ir apie laiką prie saulės, vaikų energiją po valgio ir vietą nedideliams žaidimams. Žemiau – praktinis sąrašas ir kodėl konkretūs punktai sutaupo nervų.</p>

        <h3>🧺 1. Krepšiai ir Indai</h3>
        <p>Termo krepšys arba izoliuota kuprinė ilgesniam išvykimui – ne prabanga, kai lauke virš dvidešimties laipsnių. Maistą sluoksniuokite: sunkesnis apačioje, traškūs slapukai ar duona – iš viršiaus. Šakutės ir šaukštai iš perpakuotų rinkinių sumažina plastiko sąšlavą ir palengvina pakavimą namo.</p>

        <h3>🥪 2. Maistas</h3>
        <p>Gerai tarnauja sumuštiniai su kietesne duona, vaisiai su luobele, termiškai stabilesni užkandžiai nei kreminiai padažai atidarytuose induose. Karščiui jautrų maistą imkite tik su šaltomis blokelėmis po visu krepšiu, ne vienoje kišenėje.</p>

        <h3>💧 3. Gėrimai ir Vanduo</h3>
        <p>Vanduo buteliuose kartu yra ir sauga nuo perkaitimo, ir būtinybė prie bet kokio alkoholio nešiojimo (jei suaugusiesiems – atsakingai ir neprieinama vaikams). Ledinė arbata termose arba praskiestos sultys sumažina cukraus smūgį vaikams lyginant su gazuotais gėrimais.</p>

        <h3>☀️ 4. Saulės Apsauga ir Komfortas</h3>
        <p>Skėtis, kepurė, kremas nuo saulės ir antklodė ant žolės – standartas, bet patikrinkite, ar skėtis turi tvirtą pagrindą vėjuotai dienai. Jei vaikai – numatykite šešėlio „bazę“ net jei jūs mėgstate saulę – po valgio jie dažnai nori ramybės minutės.</p>

        <h3>💦 5. Vandens Žaidimai šalia Antklodės</h3>
        <p>Piknikas ir vandens žaidimas gali derėti, jei atskiriate zonas: maistas toliau nuo purslų, o <Link to="/p/1001" className="text-blue-600 hover:underline">vandens šautuvai ar pistoletai</Link> – po žinomomis saugumo taisyklėmis prie šlapia žemė prieš tai patikrinkite. Nedideli balionai pertraukoms tarp valgių kartais linksminą labiau nei vienas sunkus automatas mažoje erdvėje.</p>

        <h3>🌟 Apibendrinimas</h3>
        <p>Gerai sudėtas krepšys – daugiau poilsio žmonėms ir mažiau „pamirštų daiktų“ streso. Vandens atrakcijoms užsukite į <Link to="/#products" className="text-blue-600 hover:underline">Vasaros Kampelio katalogą</Link>; ten rasite tinkamus įrankius tiek kiemui, tiek išvykai.</p>
      </article>
    </PageWrapper>
  );
}
