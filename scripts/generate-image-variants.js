// Generate .webp and .avif variants for local product images in /public/products/**
// Also generates responsive srcset variants for hero and product images in /public/
// Requires: sharp (installed in devDependencies)
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PRODUCTS_DIR = path.join(ROOT, 'public', 'products');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Hero: 480w, 768w, 1024w for mobile/tablet/desktop
const HERO_WIDTHS = [480, 768, 1024];
// Product: 306w (thumb/card), 512w (medium), 612w (detail), 1024w (large)
const PRODUCT_WIDTHS = [306, 512, 612, 1024];
// Review avatars: 88w for 44px display at 2x retina (used in ReviewsSection)
const AVATAR_WIDTH = 88;
const REVIEW_AVATARS = ['giedre1.png', 'tomas2.png', 'mantas1.jpg', 'ruta1.jpg', 'jonas1.jpg', 'andrius3.jpg'];

async function ensureVariant(srcPath, formatExt) {
  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, path.extname(srcPath));
  const out = path.join(dir, `${base}.${formatExt}`);
  if (fs.existsSync(out)) return;
  try {
    const isHero = /megztiniai\/red\.(png|jpe?g)$/i.test(srcPath);
    const maxWidth = isHero ? 1600 : 1200;
    const maxHeight = isHero ? 1200 : 900;
    const quality = formatExt === 'webp' ? 80 : 55;

    const pipeline = sharp(srcPath).resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true });
    await pipeline.toFormat(formatExt === 'webp' ? 'webp' : 'avif', { quality }).toFile(out);
    console.log('Generated', out.replace(ROOT, ''));
  } catch (e) {
    console.warn('Skip variant for', srcPath, e?.message || e);
  }
}

async function generateResponsiveVariant(srcPath, widthW) {
  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, path.extname(srcPath));
  const ext = path.extname(srcPath);
  const out = path.join(dir, `${base}-${widthW}w${ext}`);
  const isHero = /hero-.+\.webp$/i.test(path.basename(srcPath));
  const quality = isHero ? 65 : 75;
  if (fs.existsSync(out) && !isHero) return;
  try {
    await sharp(srcPath)
      .resize({ width: widthW, fit: 'inside', withoutEnlargement: true })
      .toFormat(ext === '.webp' ? 'webp' : ext === '.avif' ? 'avif' : 'webp', { quality })
      .toFile(out);
    console.log('Generated', out.replace(ROOT, ''));
  } catch (e) {
    console.warn('Skip responsive variant', srcPath, widthW, e?.message || e);
  }
}

function isRaster(file) {
  return /\.(png|jpg|jpeg)$/i.test(file);
}

function isWebp(file) {
  return /\.webp$/i.test(file);
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await walk(p);
    } else if (ent.isFile() && isRaster(ent.name)) {
      await ensureVariant(p, 'webp');
      await ensureVariant(p, 'avif');
    }
  }
}

async function generateAvatarVariant(srcPath) {
  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, path.extname(srcPath));
  const out = path.join(dir, `${base}-${AVATAR_WIDTH}w.webp`);
  if (fs.existsSync(out)) return;
  try {
    await sharp(srcPath)
      .resize({ width: AVATAR_WIDTH, height: AVATAR_WIDTH, fit: 'cover' })
      .toFormat('webp', { quality: 80 })
      .toFile(out);
    console.log('Generated', out.replace(ROOT, ''));
  } catch (e) {
    console.warn('Skip avatar variant', srcPath, e?.message || e);
  }
}

async function processReviewAvatars() {
  if (!fs.existsSync(PUBLIC_DIR)) return;
  for (const file of REVIEW_AVATARS) {
    const p = path.join(PUBLIC_DIR, file);
    if (fs.existsSync(p)) {
      await generateAvatarVariant(p);
    }
  }
}

async function processHeroAndProductImages() {
  if (!fs.existsSync(PUBLIC_DIR)) return;
  const files = fs.readdirSync(PUBLIC_DIR);
  for (const file of files) {
    const p = path.join(PUBLIC_DIR, file);
    if (!fs.statSync(p).isFile()) continue;
    // Only process base hero images (exclude already-generated -480w, -768w, -1024w variants)
    if (/^hero-.+\.webp$/i.test(file) && !/-\d+w\.webp$/i.test(file)) {
      for (const w of HERO_WIDTHS) {
        await generateResponsiveVariant(p, w);
      }
    } else if (isWebp(file) && /^(blue|pink|bluepistol|pinkpistol)\d+\.webp$/i.test(file)) {
      for (const w of PRODUCT_WIDTHS) {
        await generateResponsiveVariant(p, w);
      }
    }
  }
}

async function main() {
  const tasks = [];
  if (fs.existsSync(PRODUCTS_DIR)) {
    tasks.push(walk(PRODUCTS_DIR));
  } else {
    console.log('No /public/products directory found; skipping product variants.');
  }
  tasks.push(processHeroAndProductImages());
  tasks.push(processReviewAvatars());
  await Promise.all(tasks).catch((e) => {
    console.error('Image variant generation failed:', e);
    process.exit(0);
  });
}

main();


