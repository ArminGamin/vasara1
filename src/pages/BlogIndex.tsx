import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { BLOG_ENTRIES } from '../data/blogEntries';

function formatListDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('lt-LT', { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
}

export default function BlogIndex() {
  const entries = useMemo(
    () => [...BLOG_ENTRIES].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [],
  );

  return (
    <PageWrapper title="Blogas" description="Vasaros patarimai, kiemo puošimo idėjos, vandens žaidimų organizavimas. Straipsniai apie vasarą, vandens šautuvus ir šeimyninius žaidimus.">
      <div className="space-y-6 text-gray-800">
        {entries.map((post) => (
          <article key={post.to} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 mb-1">{formatListDate(post.publishedAt)}</p>
            <h2 className="text-2xl font-bold mb-2">
              <Link to={post.to} className="text-brand-orange hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-700">{post.excerpt}</p>
            <div className="mt-3">
              <Link to={post.to} className="text-blue-600 hover:underline">
                Skaityti →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageWrapper>
  );
}
