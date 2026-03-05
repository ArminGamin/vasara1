# Build & Deploy Instructions

To produce a correct `dist/` for deployment:

```bash
# From the project root (christmas-shop/)
npm run build
```

**If you have an old/stale dist/**, delete it first:
```bash
rm -rf dist   # or: rmdir /s /q dist  (Windows)
npm run build
```

This runs (in order):

1. **prebuild** – Creates favicon files in `public/` (favicon.ico, favicon_32.png, etc.) and image variants
2. **vite build** – Builds the app; removes `data:` preload from index.html via closeBundle hook
3. **inject-sw-assets** – Injects hashed JS/CSS paths into `dist/service-worker.js`
4. **generate:sitemaps** – Regenerates sitemaps in `public/`
5. **ping:sitemaps** – Pings search engines

**Important:**
- Always run `npm run build` before zipping or deploying
- The `dist/` folder must be freshly built—do not use an old `dist/` from a previous build
- The `scripts/` directory must exist when building (it's in source, not in the deploy ZIP)

**Deploying:** Zip the `dist/` folder (or deploy it directly). The `scripts/` directory is only needed at build time, not in the deployed output.
