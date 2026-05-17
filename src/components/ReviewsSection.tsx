import React, { useRef, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { STOREFRONT_REVIEWS, REVIEW_IMAGE_FALLBACK } from '../data/storefrontReviews';
import './ReviewsSection.css';

function ReviewCard({ r }: { r: (typeof STOREFRONT_REVIEWS)[0] }) {
  const [imgSrc, setImgSrc] = React.useState(r.image);
  const handleError = () => {
    const fallback = REVIEW_IMAGE_FALLBACK[r.image];
    if (fallback) setImgSrc(fallback);
  };
  return (
    <div className="revo-review-card">
      <div className="flex items-center gap-3">
        <img src={imgSrc} alt="" className="w-11 h-11 rounded-full object-cover" loading="lazy" decoding="async" onError={handleError} />
        <div>
          <p className="font-semibold text-text">{r.name}</p>
          <p className="text-sm text-muted">{r.location}</p>
        </div>
      </div>
      <span className="sr-only">{`Vertinimas: ${r.rating} iš 5 žvaigždžių`}</span>
      <div className="flex gap-0.5 mt-2" aria-hidden="true">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'text-brand-gold fill-brand-gold' : 'text-border fill-none'}`} />
        ))}
      </div>
      <p className="revo-review-text">{r.text}</p>
    </div>
  );
}

export function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    if (!mq.matches) return;
    const el = scrollRef.current;
    if (!el) return;

    let half = el.scrollWidth / 2;
    let pos = el.scrollLeft;
    let pendingResize = false;
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          if (pendingResize) return;
          pendingResize = true;
          requestAnimationFrame(() => {
            half = el.scrollWidth / 2;
            pos = el.scrollLeft;
            pendingResize = false;
          });
        })
      : null;
    ro?.observe(el);

    let raf: number;
    const scroll = () => {
      if (paused) return;
      let next = pos + 0.4;
      if (next >= half - 1) next = 0;
      pos = next;
      el.scrollLeft = next;
      raf = requestAnimationFrame(scroll);
    };
    raf = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [paused]);

  const handleTouchStart = () => {
    setPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };
  const handleTouchEnd = () => {
    resumeTimeoutRef.current = setTimeout(() => setPaused(false), 2000);
  };

  return (
    <section className="py-6 md:py-10 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="revo-section-title text-center mb-2">Ką sako klientai</h2>
        <p className="revo-section-sub text-center font-semibold text-text">Tikri atsiliepimai! ✅</p>
      </div>
      <div className="revo-reviews-marquee-wrap" role="region" aria-label="Atsiliepimų slinktis">
        <div
          ref={scrollRef}
          className="revo-reviews-marquee"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className="revo-reviews-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="revo-reviews-set" aria-hidden={copy > 0}>
                {STOREFRONT_REVIEWS.map((r, i) => (
                  <ReviewCard key={`${copy}-${i}`} r={r} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
