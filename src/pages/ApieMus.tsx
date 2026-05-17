import React from 'react';
import PageWrapper from '../components/PageWrapper';

export default function ApieMus() {
  return (
    <PageWrapper title="Apie mus" description="Vasaros Kampelis – vandens šautuvai ir blasteriai vasaros žaidimams. Patikimi, saugūs, tvirti. Nemokamas pristatymas nuo 80€.">
      <div className="text-gray-800 space-y-4 text-lg font-medium">
        <h2 className="text-2xl font-bold">Apie mus</h2>
        <p>
          „Vasaros Kampelis“ gimė iš paprastos idėjos - vasara turi būti linksma. Norime, kad kiemai vėl prisipildytų juoko, vandens mūšių ir tikro judesio, o ne tik telefonų ekranų.
        </p>
        <p>
          Atrenkame vandens ginklus, kurie yra patvarūs, saugūs ir tikrai verti savo kainos. Testuojame, lyginame ir siūlome tik tai, kuo patys pasitikėtume.
        </p>
        <ul className="list-none space-y-2">
          <li>✔ Nemokamas pristatymas nuo 80€</li>
          <li>✔ Užtikrinta kokybė</li>
          <li>✔ Greitas ir saugus atsiskaitymas</li>
        </ul>
        <p>
          Jei kyla klausimų - parašykite mums. Mielai padėsime išsirinkti tinkamiausią variantą jūsų vasaros nuotykiams. 😉
        </p>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">DUK — Dažniausiai užduodami klausimai</h3>
          <div className="space-y-3">
            <details className="group rounded-lg border border-gray-200 p-4 bg-white">
              <summary className="cursor-pointer font-semibold select-none">1️⃣ Ar pristatote į visą Lietuvą?</summary>
              <p className="mt-2 text-gray-700">
                Atsakymas: Taip užsakymus pristatome į visus Lietuvos miestus. Užsakymams virš 80 € pristatymas yra nemokamas.
              </p>
            </details>

            <details className="group rounded-lg border border-gray-200 p-4 bg-white">
              <summary className="cursor-pointer font-semibold select-none">2️⃣ Kiek laiko trunka pristatymas?</summary>
              <p className="mt-2 text-gray-700">
                Atsakymas: Įprastai užsakymą pristatome per 4–6 dienas, priklausomai nuo užsakymo kiekio ir pristatymo vietos. Dedame visas pastangas, kad prekė jus pasiektų kuo greičiau. Didesnio užimtumo laikotarpiais pristatymas gali užtrukti šiek tiek ilgiau.
              </p>
            </details>

            <details className="group rounded-lg border border-gray-200 p-4 bg-white">
              <summary className="cursor-pointer font-semibold select-none">3️⃣ Ar turite fizinę parduotuvę?</summary>
              <p className="mt-2 text-gray-700">
                Atsakymas: Šiuo metu dirbame tik internetu, tačiau siūlome greitą pristatymą visoje Lietuvoje ir saugų pirkimą internetu.
              </p>
            </details>

            <details className="group rounded-lg border border-gray-200 p-4 bg-white">
              <summary className="cursor-pointer font-semibold select-none">4️⃣ Kaip sužinoti, ar prekė yra sandėlyje?</summary>
              <p className="mt-2 text-gray-700">
                Atsakymas: Produktų puslapiuose nurodoma atsargų būsena. Jei matote žymą „Turime sandėlyje“, prekę galite užsisakyti iš karto.
              </p>
            </details>

            <details className="group rounded-lg border border-gray-200 p-4 bg-white">
              <summary className="cursor-pointer font-semibold select-none">5️⃣ Kaip susisiekti, jei turiu klausimų?</summary>
              <p className="mt-2 text-gray-700">
                Atsakymas: Galite rašyti mums el. paštu <a href="mailto:vasaroskampelis@gmail.com" className="text-brand-orange underline">vasaroskampelis@gmail.com</a> arba per kontaktų puslapį. Atsakome per 24 valandas.
              </p>
            </details>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
