// Generate minimal placeholder favicon files to prevent 404s.
// Replace these with real icons before production.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// Minimal 1x1 transparent PNG (valid PNG)
const MINI_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Use minimal PNG for all - replace with real icons before production
const files = {
  'favicon.ico': MINI_PNG,
  'favicon.png': MINI_PNG,
  'favicon_32.png': MINI_PNG,
  'favicon_48.png': MINI_PNG,
  'apple-touch-icon.png': MINI_PNG,
  'og-image.jpg': MINI_PNG,
  'og-summer.png': MINI_PNG,
};

for (const [name, data] of Object.entries(files)) {
  const p = path.join(PUBLIC, name);
  if (fs.existsSync(p) && fs.statSync(p).size > 200) {
    console.log('Skipped (exists):', name);
    continue;
  }
  fs.writeFileSync(p, data);
  console.log('Created:', name);
}
