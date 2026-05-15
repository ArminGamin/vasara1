import React, { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BLOG_AUTHOR } from '../data/blogMeta';
import { resolveRelatedBlogEntries } from '../data/blogEntries';

const SITE_NAME = 'Vasaros Kampelis';
const DEFAULT_DESC = 'Galingi vandens šautuvai ir blasteriai iki 10m šūvio. Mėlyna ir rožinė spalva. Nemokamas pristatymas nuo 80€. Pristatymas į visą Lietuvą per 5–7 d.';
const SITE_ORIGIN = 'https://vasaroskampelis.com';
const DEFAULT_OG_TITLE = 'Vasaros Kampelis – Vandens šautuvai ir blasteriai Lietuvoje';
const DEFAULT_INDEX_AUTHOR = 'Vasaros Kampelis';
const BLOG_META_SCRIPT_ID = 'blog-posting-schema';
const DEFAULT_OG_DESCRIPTION =
  'Galingi vandens šautuvai iki 10m. Mėlyna ir rožinė. Nemokamas pristatymas nuo 80€. Pristatymas į visą Lietuvą per 5–7 d.';
const DEFAULT_OG_IMAGE = 'https://vasaroskampelis.com/hero-pink-ar.webp';

export { SITE_NAME, DEFAULT_DESC };

function absoluteOgImage(ogImage?: string): string {
  const raw = ogImage?.trim();
  if (!raw) return DEFAULT_OG_IMAGE;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${SITE_ORIGIN}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function formatLtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}

function upsertMeta(attr: 'property' | 'name', key: string, content: string) {
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function PageWrapper({
  title,
  bannerTitle,
  description,
  publishedAt,
  author,
  wordCount,
  keywords,
  relatedPostPaths,
  ogImage,
  modifiedAt,
  children,
}: {
  title: string;
  bannerTitle?: ReactNode;
  description?: string;
  publishedAt?: string;
  author?: string;
  /** Approximate article word count for BlogPosting JSON-LD */
  wordCount?: number;
  /** Comma-separated keywords for BlogPosting JSON-LD */
  keywords?: string;
  /** Paths like /blog/slug — titles/excerpts resolved from blogEntries */
  relatedPostPaths?: string[];
  /** Relative (/hero.webp) or absolute Open Graph image URL */
  ogImage?: string;
  /** ISO 8601 — BlogPosting dateModified */
  modifiedAt?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const relatedEntries = useMemo(
    () =>
      publishedAt && relatedPostPaths?.length
        ? resolveRelatedBlogEntries(relatedPostPaths, location.pathname)
        : [],
    [publishedAt, relatedPostPaths, location.pathname],
  );

  useEffect(() => {
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }

    const displayAuthor = publishedAt ? (author ?? BLOG_AUTHOR) : author;
    const fullTitlePlain = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    let jsonEl: HTMLScriptElement | null = null;

    if (publishedAt) {
      const resolvedOgImage = absoluteOgImage(ogImage);
      upsertMeta('property', 'article:published_time', publishedAt);
      upsertMeta('name', 'author', displayAuthor ?? BLOG_AUTHOR);

      upsertMeta('property', 'og:title', fullTitlePlain);
      upsertMeta('property', 'twitter:title', fullTitlePlain);
      upsertMeta('property', 'og:image', resolvedOgImage);
      upsertMeta('property', 'twitter:image', resolvedOgImage);
      if (description) {
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'twitter:description', description);
      }

      const url = `${SITE_ORIGIN}${location.pathname}`;
      const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        datePublished: publishedAt,
        dateModified: modifiedAt ?? publishedAt,
        inLanguage: 'lt',
        author: {
          '@type': 'Organization',
          name: displayAuthor ?? BLOG_AUTHOR,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_ORIGIN,
          logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.png` },
        },
        image: { '@type': 'ImageObject', url: resolvedOgImage },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
      };
      if (description) jsonLd.description = description;
      if (wordCount !== undefined) jsonLd.wordCount = wordCount;
      if (keywords) jsonLd.keywords = keywords;

      jsonEl = document.createElement('script');
      jsonEl.id = BLOG_META_SCRIPT_ID;
      jsonEl.type = 'application/ld+json';
      jsonEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonEl);
    }

    return () => {
      document.title = `${SITE_NAME} | Vandens šautuvai ir vasaros žaidimai Lietuvoje`;
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', DEFAULT_DESC);

      document.getElementById(BLOG_META_SCRIPT_ID)?.remove();

      if (publishedAt) {
        document.querySelector('meta[property="article:published_time"]')?.remove();
        upsertMeta('name', 'author', DEFAULT_INDEX_AUTHOR);

        upsertMeta('property', 'og:title', DEFAULT_OG_TITLE);
        upsertMeta('property', 'twitter:title', DEFAULT_OG_TITLE);
        upsertMeta('property', 'og:image', DEFAULT_OG_IMAGE);
        upsertMeta('property', 'twitter:image', DEFAULT_OG_IMAGE);
        upsertMeta('property', 'og:description', DEFAULT_OG_DESCRIPTION);
        upsertMeta('property', 'twitter:description', DEFAULT_OG_DESCRIPTION);
      }

    };
  }, [title, description, publishedAt, author, location.pathname, wordCount, keywords, ogImage, modifiedAt]);

  const banner = bannerTitle !== undefined ? bannerTitle : title;
  const showByline = !!(publishedAt || author);
  const bylineAuthor = publishedAt ? (author ?? BLOG_AUTHOR) : author;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-blue-deep text-white py-3 text-center text-lg font-bold">{banner}</div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-lg w-full">
        {showByline && (
          <p className="text-sm text-gray-600 mb-6 not-prose">
            {bylineAuthor && <span>{bylineAuthor}</span>}
            {!!bylineAuthor && !!publishedAt && ' · '}
            {publishedAt && <time dateTime={publishedAt}>{formatLtDate(publishedAt)}</time>}
          </p>
        )}
        {children}
        {relatedEntries.length > 0 && (
          <section className="not-prose mt-12 pt-10 border-t border-gray-200" aria-labelledby="related-posts-heading">
            <h2 id="related-posts-heading" className="text-2xl font-bold text-gray-900 mb-6">
              Susiję straipsniai
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEntries.map((post) => (
                <article key={post.to} className="bg-white rounded-xl shadow p-5 flex flex-col text-left">
                  <h3 className="text-lg font-bold mb-2 leading-snug">
                    <Link to={post.to} className="text-brand-orange hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-700 text-base flex-1">{post.excerpt}</p>
                  <div className="mt-3">
                    <Link to={post.to} className="text-blue-600 hover:underline text-base font-medium">
                      Skaityti →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="text-center mb-10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-brand-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-orange-hover transition min-h-[48px]"
        >
          Grįžti atgal
        </button>
      </div>
    </div>
  );
}
