// Generate sitemap index and split sitemaps (pages/products/images) at build time.
// Lightweight parser: extract product IDs from src/data/products.ts
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_PRODUCTS = path.join(ROOT, 'src', 'data', 'products.ts');
const SITE_ORIGIN = 'https://vasaroskampelis.com';

function formatDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function readProductIds() {
  try {
    const ts = fs.readFileSync(SRC_PRODUCTS, 'utf8');
    const ids = new Set();
    const re = /id:\s*(\d{3,})/g;
    let m;
    while ((m = re.exec(ts))) ids.add(m[1]);
    return Array.from(ids);
  } catch (e) {
    return [];
  }
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
}

const today = formatDate();

// sitemap_index.xml
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap-images.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

// sitemap-pages.xml
const pages = [
  '/',
  '/apie-mus',
  '/duk',
  '/pristatymo-info',
  '/grazinimai',
  '/privatumo-politika',
  '/blog',
  '/blog/kaip-sukurti-tikra-kaledu-nuotaika-namuose',
  '/blog/kalediniu-dovanu-idejos-ir-sventinio-interjero-tendencijos-2025',
  '/blog/kaip-puosti-namus-kaledoms-mazame-bute',
  '/blog/10-paprastu-budu-padaryti-namus-jaukesnius-ziema',
  '/blog/kaip-pasiruosti-kaledoms-be-streso-planavimas-dekoracijos-ir-dovanos',
];
const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${pages
    .map(
      (p) => `
  <url>
    <loc>${SITE_ORIGIN}${p}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="lt-LT" href="${SITE_ORIGIN}${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${p}"/>
  </url>`
    )
    .join('\n')}
</urlset>`;

// sitemap-products.xml
const productIds = readProductIds();
const productsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${productIds
    .map(
      (id) => `
  <url>
    <loc>${SITE_ORIGIN}/p/${id}</loc>
    <lastmod>${today}</lastmod>
  </url>`
    )
    .join('\n')}
</urlset>`;

// sitemap-images.xml – only images used by the site (no megztiniai – not in product catalog)
const images = [
  { loc: `${SITE_ORIGIN}/logo.png`, title: 'Vasaros Kampelis logotipas' },
  { loc: `${SITE_ORIGIN}/hero-pink-ar.webp`, title: 'Vandens šautuvas – rožinis' },
  { loc: `${SITE_ORIGIN}/hero-blue-ar.webp`, title: 'Vandens šautuvas – mėlynas' },
];
const imagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_ORIGIN}/</loc>
    <lastmod>${today}</lastmod>
    ${images
      .map(
        (img) => `
    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
    </image:image>`
      )
      .join('\n')}
  </url>
</urlset>`;

writeFile(path.join(PUBLIC_DIR, 'sitemap_index.xml'), indexXml);
writeFile(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), pagesXml);
writeFile(path.join(PUBLIC_DIR, 'sitemap-products.xml'), productsXml);
writeFile(path.join(PUBLIC_DIR, 'sitemap-images.xml'), imagesXml);

console.log('Sitemaps generated.');


