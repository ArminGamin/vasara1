import { createServer } from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import sirv from "sirv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");
const PORT = Number(process.env.PRERENDER_PORT || 13715);
const HOST = "127.0.0.1";

const ROUTES = [
  "/",
  "/apie-mus",
  "/blog",
  "/blog/kaip-sukurti-vasaros-nuotaika-namuose",
  "/blog/vasaros-pasiulymai-ir-idejos-2025",
  "/blog/kaip-puosti-kiema-vandens-zaidimams",
  "/blog/kaip-pasiruosti-vasarai-be-streso",
  "/blog/10-paprastu-budu-megautis-vasara-lauke",
  "/blog/vandens-musiu-organizavimas",
  "/blog/kaip-issirinkti-vandens-blasteri",
  "/blog/pikniko-idejos-vasarai",
  "/pristatymo-info",
  "/grazinimai",
  "/kontaktai",
  "/privatumo-politika",
  "/slapuku-politika",
];

function outputPathForRoute(route) {
  if (route === "/" || route === "") return path.join(DIST, "index.html");
  const clean = route.replace(/^\/+|\/+$/g, "");
  return path.join(DIST, clean, "index.html");
}

async function main() {
  if (process.env.SKIP_PRERENDER === "1") {
    console.log("[prerender] SKIP_PRERENDER=1, skipping");
    return;
  }

  try {
    await fs.access(DIST);
  } catch {
    console.log("[prerender] dist/ missing, skipping");
    return;
  }

  const serve = sirv(DIST, { single: true, dev: false, etag: false });
  const server = createServer((req, res) => serve(req, res));

  await new Promise((resolve, reject) => {
    server.listen(PORT, HOST, () => resolve());
    server.on("error", reject);
  });

  const browser = await chromium.launch({ headless: true });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `http://${HOST}:${PORT}${route}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            const maxMs = 22000;
            const t = setTimeout(resolve, maxMs);
            document.addEventListener(
              "prerender-ready",
              () => {
                clearTimeout(t);
                resolve(undefined);
              },
              { once: true }
            );
          })
      );
      const html = await page.content();
      const out = outputPathForRoute(route);
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, html, "utf8");
      await page.close();
      console.log("[prerender]", route, "->", path.relative(path.join(__dirname, ".."), out));
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve(undefined)));
    });
  }
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
