import { BLOG_PUBLISHED } from './blogMeta';

export type BlogListEntry = {
  to: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

/** Central list for blog index, related posts, and navigation — keep in sync with routes in App.tsx */
export const BLOG_ENTRIES: BlogListEntry[] = [
  {
    to: '/blog/vasaros-dovanos-vaikams',
    title: 'Vasaros Dovanos Vaikams: Ką Padovanoti?',
    excerpt:
      'Vasaros dovanos vaikams ir lauko žaislai pagal amžių: kodėl vandens įrankiai dažnai yra geriausias pasirinkimas ir kaip išvengti dovanos stalčiuje likimo.',
    publishedAt: BLOG_PUBLISHED.vasarosDovanosVaikams,
  },
  {
    to: '/blog/vandens-sautuvas-vs-pistoletas',
    title: 'Vandens Šautuvas ar Pistoletas: Ką Rinktis?',
    excerpt:
      'Vandens šautuvas prieš pistoletą: svoris, talpa, nuotolis ir amžius – trumpas vadovas prieš perkant vasaros žaidimams kieme.',
    publishedAt: BLOG_PUBLISHED.vandensSautuvasVsPistoletas,
  },
  {
    to: '/blog/ka-veikti-su-vaikais-vasara',
    title: 'Ką Veikti su Vaikais Vasarą: 8 Idėjos Lauke',
    excerpt:
      'Veikla vaikams vasarą ir vasaros idėjos šeimai – aštuonios lauko pramogos nuo vandens žaidimų iki paprastų ritualų be pertekliaus.',
    publishedAt: BLOG_PUBLISHED.kaVeiktiSuVaikaisVasara,
  },
  {
    to: '/blog/gimtadienis-lauke-vaikams',
    title: 'Gimtadienis Lauke Vaikams: Idėjos ir Planavimas',
    excerpt:
      'Lauko gimtadienis ir vaikų šventė gamtoje: zonos, svečių taisyklės ir vandens žaidimai gimtadieniui be chaoso prie torto.',
    publishedAt: BLOG_PUBLISHED.gimtadienisLaukeVaikams,
  },
  {
    to: '/blog/vandens-zaidimai-vaikams',
    title: 'Vandens žaidimai vaikams vasarą: idėjos lauke ir kieme',
    excerpt:
      'Vandens žaidimai vaikams, vasaros žaidimai lauke ir kieme – saugumas, raundai, įranga ir paprastos idėjos be pertekliaus.',
    publishedAt: BLOG_PUBLISHED.vandensZaidimaiVaikams,
  },
  {
    to: '/blog/kaip-sukurti-vasaros-nuotaika-namuose',
    title: 'Kaip Sukurti Vasaros Nuotaiką Namuose',
    excerpt:
      'Dekoracijos, idėjos ir jaukumas – paprasti žingsniai, kaip namuose ir kieme sukurti vasaros magiją.',
    publishedAt: BLOG_PUBLISHED.vasaraNamuose,
  },
  {
    to: '/blog/vasaros-pasiulymai-ir-idejos-2026',
    title: 'Vasaros Pasiūlymai ir Idėjos 2026 Metams',
    excerpt:
      'Naujausios 2026 m. vasaros tendencijos: vandens žaidimai, kiemo puošimas ir vasaros pasiūlymai – nuo šautuvų iki šeimyninių idėjų.',
    publishedAt: BLOG_PUBLISHED.vasarosPasiulymai2026,
  },
  {
    to: '/blog/kaip-puosti-kiema-vandens-zaidimams',
    title: 'Kaip Puošti Kiemą Vandens Žaidimams: Idėjos ir Patarimai',
    excerpt:
      'Mažas kiemas ar didelis – vandens šautuvai, baseinai, vandens balionai ir saulėgrąžos – idėjos be pertekliaus.',
    publishedAt: BLOG_PUBLISHED.kiemasVandens,
  },
  {
    to: '/blog/10-paprastu-budu-megautis-vasara-lauke',
    title: '10 Paprastų Būdų Mėgautis Vasarą Lauke',
    excerpt:
      'Greiti „vasarėjimo“ laimėjimai: vandens mūšiai, piknikai, šeimyniniai žaidimai, ledai ir vasaros muzika.',
    publishedAt: BLOG_PUBLISHED.desimtBudu,
  },
  {
    to: '/blog/kaip-pasiruosti-vasarai-be-streso',
    title: 'Kaip Pasiruošti Vasarai Be Streso: Planavimas ir Pasiūlymai',
    excerpt:
      'Žingsnis po žingsnio planas: pasiruošimas pavasarį, kiemo puošimas gegužę, vandens žaidimų rinkinys ir vasaros dovanos.',
    publishedAt: BLOG_PUBLISHED.vasaraBeStreso,
  },
  {
    to: '/blog/vandens-musiu-organizavimas',
    title: 'Vandens Mūšių Organizavimas: Kaip Surengti Nepamirštamą Vasaros Dieną',
    excerpt:
      'Žingsnis po žingsnio: komandos, taisyklės, šautuvai ir saugumas – viskas, ko reikia, kad visi mėgautųsi.',
    publishedAt: BLOG_PUBLISHED.vandensMusiai,
  },
  {
    to: '/blog/kaip-issirinkti-vandens-blasteri',
    title: 'Kaip Išsirinkti Tinkamą Vandens Blasterį Savo Šeimai',
    excerpt:
      'Dydis, talpa, automatinis ar rankinis – trumpas vadovas, kad rastumėte tinkamą šautuvą vaikams ir suaugusiems.',
    publishedAt: BLOG_PUBLISHED.blasteriai,
  },
  {
    to: '/blog/pikniko-idejos-vasarai',
    title: 'Pikniko Idėjos Vasarai: Ko Nepasimiršti',
    excerpt: 'Krepšiai, maistas, gėrimai ir vandens žaidimai – sąrašas ir patarimai, kad piknikas būtų tobulas.',
    publishedAt: BLOG_PUBLISHED.pikniko,
  },
];

function normPath(p: string): string {
  const withSlash = p.startsWith('/') ? p : `/${p}`;
  return withSlash === '/' ? '/' : withSlash.replace(/\/$/, '');
}

/** Resolve related posts by path for cards; skips unknown paths and current article */
export function resolveRelatedBlogEntries(paths: string[], currentPathname: string): BlogListEntry[] {
  const cur = normPath(currentPathname);
  const seen = new Set<string>();
  const out: BlogListEntry[] = [];
  for (const raw of paths) {
    const n = normPath(raw);
    if (n === cur || seen.has(n)) continue;
    const entry = BLOG_ENTRIES.find((e) => normPath(e.to) === n);
    if (entry) {
      seen.add(n);
      out.push(entry);
      if (out.length >= 3) break;
    }
  }
  return out;
}
