import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { BLOG_PUBLISHED, BLOG_DESCRIPTION } from '../../data/blogMeta';

export default function BlogPostKiemasVandens() {
  return (
    <PageWrapper
      title="Kaip Puošti Kiemą Vandens Žaidimams: Idėjos ir Patarimai"
      bannerTitle={
        <>
          <span aria-hidden="true">💦 </span>
          Kaip Puošti Kiemą Vandens Žaidimams: Idėjos ir Patarimai
        </>
      }
      publishedAt={BLOG_PUBLISHED.kiemasVandens}
      description={BLOG_DESCRIPTION.kiemasVandens}
    >
      <article className="prose prose-lg max-w-none">
        <p>Mažas kiemas ar siaura terasa nereiškia, kad vandens žaidimų atmosfera neįmanoma – reikia tik atskirti „šlapia“ zoną nuo „sausos“ ir naudoti vertikalią erdvę bei tekstilę vietoj papildomų didelių baldų. Žemiau – kaip tai padaryti praktiškai.</p>

        <h3>💦 1. Zonavimas trims veikloms</h3>
        <p>Gera mažos erdvės schema: (1) refill ir kibiras ar mažas baseinėlis, (2) purslų zona trumpiems roundams, (3) sausas kampas rankšluosčiams ir batams. Kai visi žino ribas – mažiau ginčų ir mažiau vandens ant durų.</p>

        <h3>🏖️ 2. Vandens įranga vietoj gigantiško baseino</h3>
        <p>Jei didelės įrangos nesodinate, daug duoda keli tinkami įrankiai ir vienas aiškus laikymo taškas. <Link to="/p/1001" className="text-blue-600 hover:underline">Vandens šautuvai ir pistoletai iš katalogo</Link> būna skirtingų dydžių ir talpų – parinkite pagal tai, kam dažniausiai teks nešiotis įrankį.</p>

        <h3>🎨 3. Tekstilė ir šešėlis</h3>
        <p>Vasaros pagalvėlės lauko audiniu, šiaudinis kilimėlis ir skėtis kartu vizualiai praplėčia erdvę, nors fizinių kvadratinių metrų neprideda. Mėlynos, geltonos ar baltos juostos tarpusavyje nedirgina karštomis dienomis tiek kaip perdėtai sodrios spalvos.</p>

        <h3>🌿 4. Augalai vietoj naujų statinių</h3>
        <p>Langų dėžės, pakabinamos lysvės ir vazonai prie laiptų duoda įvairovę neišplėtodami horizontaliai. Tai padeda išlaikyti matomą vandens zoną nepaslėptą po augalais – saugumas svarbesnis už „gyvų sienų“.</p>

        <h3>🍉 5. Ritualai, ne tik daiktai</h3>
        <p>Gaivinančios arbatos ar ledo vanduo termosuose svečiams ir lengvas grojaraštis pakeičia nuotaiką tiek pat, kiek naujas kilimėlis – ir kainuoja mažiau nervų nei pilnas perdarymas.</p>

        <h3>📦 Po žaidimo</h3>
        <p>Iš anksto pagalvokite kur džiūsta įranga ir kur laikote ją nakčiai – kai kiekvienas įrankis turi vietą, kiemas neprimena nuolatinės stovyklos po kiekvieno savaitgalio.</p>

        <p>Daugiau pavyzdžių vienoje vietoje – <Link to="/#products" className="text-blue-600 hover:underline">Vasaros Kampelio prekių vitrina</Link>.</p>
      </article>
    </PageWrapper>
  );
}
