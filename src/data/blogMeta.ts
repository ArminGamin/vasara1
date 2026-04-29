export const BLOG_AUTHOR = 'Vasaros Kampelis komanda';

/** ISO 8601 — naudojama Article / BlogPosting schema ir <time> */
export const BLOG_PUBLISHED = {
  vasaraNamuose: '2026-02-14T09:00:00+02:00',
  vasarosPasiulymai2026: '2026-04-18T09:00:00+02:00',
  kiemasVandens: '2026-03-22T09:00:00+02:00',
  desimtBudu: '2026-01-30T09:00:00+02:00',
  vasaraBeStreso: '2026-02-28T09:00:00+02:00',
  vandensMusiai: '2026-04-05T09:00:00+02:00',
  blasteriai: '2026-03-10T09:00:00+02:00',
  pikniko: '2026-04-12T09:00:00+02:00',
} as const;

/** Unikalūs meta aprašai (SERP og:description ir name=description įrašuose) */
export const BLOG_DESCRIPTION: Record<keyof typeof BLOG_PUBLISHED, string> = {
  vasaraNamuose:
    'Kaip namuose ir kieme sukurti vasaros nuotaiką: temos, vandens žaidimo zona, šešėlis ir sutartos taisyklės. Idėjos dekorui ir laikui kartu Lauke.',
  vasarosPasiulymai2026:
    '2026 m. vasaros tendencijos Lauke: tvarus kiemas, vanduo kaip centras ir šeimyninės dovanų idėjos. Praktinis vedimas nuo zonos iki biudžeto.',
  kiemasVandens:
    'Kaip sutvarkyti mažą kiemą ar terasą vandens žaidimams: zonos („šlapia“ vs „sausa“), refill, tekstilė ir saugumas. Be perteklius ir bereikalingos įrangos.',
  desimtBudu:
    'Dešimt būdų mėgautis vasara lauke: vandens mūšiai, kiemo jaukumas, skonis ir muzika – tinka mažiam kiemui ir savaitgalio rutinai.',
  vasaraBeStreso:
    'Pasiruošimas vasarai etapais: inventoriaus tikrinimas, kiemas, vandens žaidimų paruošimas ir ramybės rutina. Mažiau skubos, daugiau smagaus laiko Lauke.',
  vandensMusiai:
    'Vandens mūšis kieme ar parke: vietos pasirinkimas, komandos ir saugumo taisyklės refill taškams bei pertraukoms. Surenkite nepamirštamą dieną visai šeimai.',
  blasteriai:
    'Kaip rinktis vandens šautuvą ar pistoletą: svoris vaikams, talpa, rankinis prieš automatinį režimą ir ženklai ant pakuotės. Trumpas vadovas tėvams Lietuvoje.',
  pikniko:
    'Pikniko sąrašas vasarą: maistas terminose ir induose, vanduo, saulės apsauga ir vandens žaidimai prie antklodės. Ko nepamiršti išvykus iš namų.',
};
