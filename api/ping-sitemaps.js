export default async function handler(req, res) {
  try {
    const indexUrl = `https://vasaroskampelis.com/sitemap_index.xml`;
    const google = `https://www.google.com/ping?sitemap=${encodeURIComponent(indexUrl)}`;
    const bing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(indexUrl)}`;
    const [g, b] = await Promise.allSettled([fetch(google), fetch(bing)]);
    return res.status(200).json({
      ok: true,
      google: g.status === 'fulfilled' ? g.value.status : 'error',
      bing: b.status === 'fulfilled' ? b.value.status : 'error',
    });
  } catch (e) {
    console.error('Ping error', e);
    return res.status(500).json({ ok: false });
  }
}


