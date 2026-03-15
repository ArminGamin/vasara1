import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function BlogIndex() {
  return (
    <PageWrapper title="Blogas" description="Vasaros patarimai, kiemo puošimo idėjos, vandens žaidimų organizavimas. Straipsniai apie vasarą, vandens blasterius ir šeimyninius žaidimus.">
      <div className="space-y-6 text-gray-800">
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/kaip-sukurti-vasaros-nuotaika-namuose" className="text-brand-orange hover:underline">
              ☀️ Kaip Sukurti Vasaros Nuotaiką Namuose
            </Link>
          </h2>
          <p className="text-gray-700">
            Dekoracijos, idėjos ir jaukumas – paprasti žingsniai, kaip namuose ir kieme sukurti vasaros magiją.
          </p>
          <div className="mt-3">
            <Link to="/blog/kaip-sukurti-vasaros-nuotaika-namuose" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/vasaros-pasiulymai-ir-idejos-2025" className="text-brand-orange hover:underline">
              🏖️ Vasaros Pasiūlymai ir Idėjos 2025 Metams
            </Link>
          </h2>
          <p className="text-gray-700">
            Naujausios 2025 m. vasaros tendencijos: vandens žaidimai, kiemo puošimas ir vasaros pasiūlymai – nuo blasterių iki šeimyninių idėjų.
          </p>
          <div className="mt-3">
            <Link to="/blog/vasaros-pasiulymai-ir-idejos-2025" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/kaip-puosti-kiema-vandens-zaidimams" className="text-brand-orange hover:underline">
              💦 Kaip Puošti Kiemą Vandens Žaidimams: Idėjos ir Patarimai
            </Link>
          </h2>
          <p className="text-gray-700">
            Mažas kiemas ar didelis – vandens blasteriai, baseinai, vandens balionai ir saulėgrąžos – idėjos be pertekliaus.
          </p>
          <div className="mt-3">
            <Link to="/blog/kaip-puosti-kiema-vandens-zaidimams" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/10-paprastu-budu-megautis-vasara-lauke" className="text-brand-orange hover:underline">
              🌴 10 Paprastų Būdų Mėgautis Vasarą Lauke
            </Link>
          </h2>
          <p className="text-gray-700">
            Greiti „vasarėjimo“ laimėjimai: vandens mūšiai, piknikai, šeimyniniai žaidimai, ledai ir vasaros muzika.
          </p>
          <div className="mt-3">
            <Link to="/blog/10-paprastu-budu-megautis-vasara-lauke" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/kaip-pasiruosti-vasarai-be-streso" className="text-brand-orange hover:underline">
              🍉 Kaip Pasiruošti Vasarai Be Streso: Planavimas ir Pasiūlymai
            </Link>
          </h2>
          <p className="text-gray-700">
            Žingsnis po žingsnio planas: pasiruošimas pavasarį, kiemo puošimas gegužę, vandens žaidimų rinkinys ir vasaros dovanos.
          </p>
          <div className="mt-3">
            <Link to="/blog/kaip-pasiruosti-vasarai-be-streso" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/vandens-musiu-organizavimas" className="text-brand-orange hover:underline">
              🎯 Vandens Mūšių Organizavimas: Kaip Surengti Nepamirštamą Vasaros Dieną
            </Link>
          </h2>
          <p className="text-gray-700">
            Žingsnis po žingsnio: komandos, taisyklės, blasteriai ir saugumas – viskas, ko reikia, kad visi mėgautųsi.
          </p>
          <div className="mt-3">
            <Link to="/blog/vandens-musiu-organizavimas" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/kaip-issirinkti-vandens-blasteri" className="text-brand-orange hover:underline">
              🔫 Kaip Išsirinkti Tinkamą Vandens Blasterį Savo Šeimai
            </Link>
          </h2>
          <p className="text-gray-700">
            Dydis, talpa, automatinis ar rankinis – trumpas vadovas, kad rastumėte idealų blasterį vaikams ir suaugusiems.
          </p>
          <div className="mt-3">
            <Link to="/blog/kaip-issirinkti-vandens-blasteri" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
        <article className="bg-white rounded-xl shadow p-5">
          <h2 className="text-2xl font-bold mb-2">
            <Link to="/blog/pikniko-idejos-vasarai" className="text-brand-orange hover:underline">
              🧺 Pikniko Idėjos Vasarai: Ko Nepasimiršti
            </Link>
          </h2>
          <p className="text-gray-700">
            Krepšiai, maistas, gėrimai ir vandens žaidimai – sąrašas ir patarimai, kad piknikas būtų tobulas.
          </p>
          <div className="mt-3">
            <Link to="/blog/pikniko-idejos-vasarai" className="text-blue-600 hover:underline">
              Skaityti →
            </Link>
          </div>
        </article>
      </div>
    </PageWrapper>
  );
}
