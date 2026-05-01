import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { BLOG_PUBLISHED } from '../data/blogMeta';

function formatListDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('lt-LT', { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
}

type Entry = {
  to: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

const RAW_ENTRIES: Entry[] = [
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

export default function BlogIndex() {
  const entries = useMemo(
    () => [...RAW_ENTRIES].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [],
  );

  return (
    <PageWrapper title="Blogas" description="Vasaros patarimai, kiemo puošimo idėjos, vandens žaidimų organizavimas. Straipsniai apie vasarą, vandens šautuvus ir šeimyninius žaidimus.">
      <div className="space-y-6 text-gray-800">
        {entries.map((post) => (
          <article key={post.to} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 mb-1">{formatListDate(post.publishedAt)}</p>
            <h2 className="text-2xl font-bold mb-2">
              <Link to={post.to} className="text-brand-orange hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-700">{post.excerpt}</p>
            <div className="mt-3">
              <Link to={post.to} className="text-blue-600 hover:underline">
                Skaityti →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageWrapper>
  );
}
