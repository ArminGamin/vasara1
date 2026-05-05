# Blog architecture

1. **Post component** — `src/pages/blog/BlogPost*.tsx`: default export, `PageWrapper` with `title`, `bannerTitle`, `publishedAt`, `modifiedAt`, `description`, `ogImage`, `wordCount`, `keywords`, `relatedPostPaths`, inner `<article className="prose prose-lg max-w-none">`.

2. **Meta** — `src/data/blogMeta.ts`: add keys to `BLOG_PUBLISHED`, mirror in `BLOG_MODIFIED`, add `BLOG_DESCRIPTION`.

3. **Index & related** — `src/data/blogEntries.ts`: append to `BLOG_ENTRIES` (`to`, `title`, `excerpt`, `publishedAt`).

4. **Routes** — `src/App.tsx`: `lazy(() => import(...))` + `<Route path="/blog/slug" ... />`.

5. **Prerender** — `scripts/prerender.mjs`: add path to `ROUTES`.

6. **Sitemap** — `scripts/generate-sitemaps.js`: add `{ path: '/blog/slug', ... }` to `pages`.

Example slugs: `/blog/gimtadienis-lauke-vaikams`, `/blog/ka-veikti-su-vaikais-vasara`, `/blog/vandens-sautuvas-vs-pistoletas`, `/blog/vasaros-dovanos-vaikams`.

Keep slugs identical everywhere. Related posts must exist in `BLOG_ENTRIES`.
