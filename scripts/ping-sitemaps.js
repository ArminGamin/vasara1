// Pings Google and Bing with the sitemap index URL
import https from 'https';

const SITEMAP_URL = 'https://vasaroskampelis.com/sitemap_index.xml';
const targets = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
];

function get(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        res.resume();
        resolve({ url, status: res.statusCode });
      })
      .on('error', (err) => resolve({ url, error: err?.message || 'request_error' }));
  });
}

Promise.all(targets.map(get)).then((results) => {
  results.forEach((r) => console.log('Ping:', r.url, '=>', r.status || r.error));
});


