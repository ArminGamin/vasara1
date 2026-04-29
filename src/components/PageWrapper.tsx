import React, { useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BLOG_AUTHOR } from '../data/blogMeta';

const SITE_NAME = 'Vasaros Kampelis';
const DEFAULT_DESC = 'Galingi vandens šautuvai ir blasteriai iki 10m šūvio. Mėlyna ir rožinė spalva. Nemokamas pristatymas nuo 80€. Pristatymas į visą Lietuvą per 8–12 d.';
const SITE_ORIGIN = 'https://vasaroskampelis.com';
const DEFAULT_OG_TITLE = 'Vasaros Kampelis – Vandens šautuvai ir blasteriai Lietuvoje';
const DEFAULT_INDEX_AUTHOR = 'Vasaros Kampelis';
const BLOG_META_SCRIPT_ID = 'blog-posting-schema';
const DEFAULT_OG_DESCRIPTION =
  'Galingi vandens šautuvai iki 10m. Mėlyna ir rožinė. Nemokamas pristatymas nuo 80€. Pristatymas į visą Lietuvą.';

export { SITE_NAME, DEFAULT_DESC };

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
  children,
}: {
  title: string;
  bannerTitle?: ReactNode;
  description?: string;
  publishedAt?: string;
  author?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

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
      upsertMeta('property', 'article:published_time', publishedAt);
      upsertMeta('name', 'author', displayAuthor ?? BLOG_AUTHOR);

      upsertMeta('property', 'og:title', fullTitlePlain);
      upsertMeta('property', 'twitter:title', fullTitlePlain);
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
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
      };
      if (description) jsonLd.description = description;

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
        upsertMeta('property', 'og:description', DEFAULT_OG_DESCRIPTION);
        upsertMeta('property', 'twitter:description', DEFAULT_OG_DESCRIPTION);
      }

    };
  }, [title, description, publishedAt, author, location.pathname]);

  const banner = bannerTitle !== undefined ? bannerTitle : title;
  const showByline = !!(publishedAt || author);
  const bylineAuthor = publishedAt ? (author ?? BLOG_AUTHOR) : author;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-blue-deep text-white py-3 text-center text-lg font-bold">{banner}</div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-lg">
        {showByline && (
          <p className="text-sm text-gray-600 mb-6 not-prose">
            {bylineAuthor && <span>{bylineAuthor}</span>}
            {!!bylineAuthor && !!publishedAt && ' · '}
            {publishedAt && <time dateTime={publishedAt}>{formatLtDate(publishedAt)}</time>}
          </p>
        )}
        {children}
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
