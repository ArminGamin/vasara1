// Run after build: inject hashed JS/CSS paths into service-worker.js for offline caching.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIST = path.join(__dirname, '..', 'dist');
const SW_PATH = path.join(DIST, 'service-worker.js');
const ASSETS_DIR = path.join(DIST, 'assets');

if (!fs.existsSync(DIST)) {
  console.log('[inject-sw-assets] dist/ not found, skipping');
  process.exit(0);
}

let assetPaths = [];
if (fs.existsSync(ASSETS_DIR)) {
  assetPaths = fs.readdirSync(ASSETS_DIR)
    .filter((f) => /\.(js|css)$/.test(f))
    .map((a) => `/assets/${a}`);
}

const baseAssets = [
  "'/'",
  "'/index.html'",
  "'/manifest.json'",
  "'/robots.txt'",
  ...assetPaths.map((p) => `'${p}'`),
];

let sw = fs.readFileSync(SW_PATH, 'utf8');
const newStaticAssets = `const STATIC_ASSETS = [\n  ${baseAssets.join(',\n  ')}\n];`;
sw = sw.replace(/const STATIC_ASSETS = \[[\s\S]*?\];/, newStaticAssets);
fs.writeFileSync(SW_PATH, sw);
console.log('[inject-sw-assets] Injected', assetPaths.length, 'assets into service-worker.js');
