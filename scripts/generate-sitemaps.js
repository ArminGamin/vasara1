// Generate sitemap index and split sitemaps (pages/products/images) at build time.
// Lightweight parser: extract product IDs from src/data/products.ts
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');
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

// sitemap-pages.xml – priority: 1.0=home, 0.9=key pages, 0.8=blog index, 0.7=blog posts
const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/apie-mus', priority: '0.9', changefreq: 'monthly' },
  { path: '/pristatymo-info', priority: '0.9', changefreq: 'monthly' },
  { path: '/grazinimai', priority: '0.9', changefreq: 'monthly' },
  { path: '/kontaktai', priority: '0.9', changefreq: 'monthly' },
  { path: '/privatumo-politika', priority: '0.7', changefreq: 'yearly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/kaip-sukurti-vasaros-nuotaika-namuose', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/vasaros-pasiulymai-ir-idejos-2026', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/kaip-puosti-kiema-vandens-zaidimams', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/10-paprastu-budu-megautis-vasara-lauke', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/kaip-pasiruosti-vasarai-be-streso', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/vandens-musiu-organizavimas', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/vandens-zaidimai-vaikams', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/kaip-issirinkti-vandens-blasteri', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/pikniko-idejos-vasarai', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/gimtadienis-lauke-vaikams', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/ka-veikti-su-vaikais-vasara', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/vandens-sautuvas-vs-pistoletas', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/vasaros-dovanos-vaikams', priority: '0.7', changefreq: 'monthly' },
];
const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${pages
    .map(
      (p) => `
  <url>
    <loc>${SITE_ORIGIN}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <xhtml:link rel="alternate" hreflang="lt-LT" href="${SITE_ORIGIN}${p.path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${p.path}"/>
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
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

// sitemap-images.xml – only images used by the site
const images = [
  { loc: `${SITE_ORIGIN}/logo.png`, title: 'Vasaros Kampelis logotipas' },
  { loc: `${SITE_ORIGIN}/hero-pink-ar.webp`, title: 'Vandens šautuvas – rožinis' },
  { loc: `${SITE_ORIGIN}/hero-blue-ar.webp`, title: 'Vandens šautuvas – mėlynas' },
  { loc: `${SITE_ORIGIN}/hero-pink-glock.webp`, title: 'Vandens pistoletas – rožinis' },
  { loc: `${SITE_ORIGIN}/hero-blue-glock.webp`, title: 'Vandens pistoletas – mėlynas' },
  { loc: `${SITE_ORIGIN}/blue1.webp`, title: 'Vandens šautuvas mėlyna spalva' },
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
writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), indexXml); // sitemap.xml = index for crawlers
writeFile(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), pagesXml);
writeFile(path.join(PUBLIC_DIR, 'sitemap-products.xml'), productsXml);
writeFile(path.join(PUBLIC_DIR, 'sitemap-images.xml'), imagesXml);

const SITEMAP_FILES = [
  'sitemap.xml',
  'sitemap_index.xml',
  'sitemap-pages.xml',
  'sitemap-products.xml',
  'sitemap-images.xml',
];

if (fs.existsSync(DIST_DIR)) {
  for (const file of SITEMAP_FILES) {
    fs.copyFileSync(path.join(PUBLIC_DIR, file), path.join(DIST_DIR, file));
  }
  console.log('Sitemaps copied to dist/.');
} else {
  console.warn('dist/ not found; sitemaps only written to public/. Run after vite build for deploy output.');
}

console.log('Sitemaps generated.');


