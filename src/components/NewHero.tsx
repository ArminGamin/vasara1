import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { StorefrontReview } from '../data/storefrontReviews';
import { STOREFRONT_REVIEWS, REVIEW_IMAGE_FALLBACK } from '../data/storefrontReviews';

import { WbShoppingBagIcon } from './icons/WbShoppingBagIcon';

const HERO_SLIDE_SRC = ['/hero-blue-11.webp', '/hero-blue-22.webp'] as const;
/** Must match index.html <link rel="preload"> and LCP placeholder src */
export const HERO_LCP_SRC = HERO_SLIDE_SRC[0];
const SLIDE_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 50;

function scrollToProducts(): void {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

const HERO_SOCIAL_ORDER = ['Andrius R.', 'Mantas K.', 'Jonas P.', 'Rūta L.'] as const;

const HERO_SOCIAL_AVATARS: StorefrontReview[] = HERO_SOCIAL_ORDER.map((name) =>
  STOREFRONT_REVIEWS.find((r) => r.name === name)
).filter((r): r is StorefrontReview => Boolean(r));

function HeroSocialAvatar({ originalSrc, title }: { originalSrc: string; title: string }) {
  const [src, setSrc] = useState(originalSrc);
  useEffect(() => {
    setSrc(originalSrc);
  }, [originalSrc]);
  return (
    <img
      src={src}
      alt=""
      title={title}
      width={32}
      height={32}
      className="wb-hero-avatar"
      loading="lazy"
      decoding="async"
      onError={() => {
        const fb = REVIEW_IMAGE_FALLBACK[originalSrc];
        if (fb) setSrc(fb);
      }}
    />
  );
}

const FEATURE_ICONS = [
  <svg key="r" className="wb-hero-feature-icon" viewBox="0 0 44 44" fill="none" aria-hidden>
    <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="22" cy="22" r="5.5" stroke="currentColor" strokeWidth="2.5" />
    <line x1="22" y1="5" x2="22" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="34" x2="22" y2="39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="5" y1="22" x2="10" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="34" y1="22" x2="39" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>,
  <svg key="d" className="wb-hero-feature-icon" viewBox="0 0 44 44" fill="none" aria-hidden>
    <path
      d="M22 7C22 7 11 18 11 27C11 33.6 15.9 39 22 39C28.1 39 33 33.6 33 27C33 18 22 7 22 7Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M17 30C17 26.5 19.5 24 22 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>,
  <svg key="z" className="wb-hero-feature-icon" viewBox="0 0 44 44" fill="none" aria-hidden>
    <path d="M24 7L14 24H22L20 37L30 20H22L24 7Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="s" className="wb-hero-feature-icon" viewBox="0 0 44 44" fill="none" aria-hidden>
    <path d="M22 7L34 11L34 24C34 32 28 38 22 40C16 38 10 32 10 24L10 11Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M16 22L20 26L28 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export const NewHero = React.memo(function NewHero({ language }: { language: string }) {
  const lt = language === 'lt';
  const slideAlts = lt
    ? [
        'Mergina prie baseino su mėlynu ir baltu vandens šautuvu, vanduo taškosi į šoną',
        'Mergina prie baseino su pilkai rožiniu vandens šautuvu, fone flamingo ir baseinas',
      ]
    : [
        'Smiling woman by a pool with a blue and white water blaster spraying water',
        'Woman by a pool holding a grey and pink water blaster, pink flamingo float behind',
      ];

  const copy = lt
    ? {
        badge: 'Šios vasaros hitas',
        lineDark: 'Elektrinis',
        lineBlueA: 'vandens',
        lineBlueB: 'šautuvas',
        sub: 'Galingas. Taiklus. Automatinis.',
        feats: [
          { val: 'IKI 10M', lab: 'šūvio nuotolis' },
          { val: '800 ML', lab: 'talpos bakelis' },
          { val: 'AUTOMATINIS', lab: 'elektrinis režimas' },
          { val: 'SAUGUS', lab: 'ir patogus' },
        ],
        cta: 'Pirkti dabar',
        socialStrong: '+99',
        socialSpan: 'Laimingų klientų',
        glass: [
          { title: 'Greitas pristatymas', sub: '4–6 dienos visoje Lietuvoje' },
          { title: 'Kokybės garantija', sub: 'Aukštos kokybės medžiagos' },
          { title: 'Saugus apmokėjimas', sub: '100 % apsaugoti duomenys' },
        ],
        dotsLabel: 'Hero nuotraukos',
        dotLabel: (n: number) => `Skaidrė ${n}`,
      }
    : {
        badge: 'This summer’s hit',
        lineDark: 'Electric',
        lineBlueA: 'water',
        lineBlueB: 'blaster',
        sub: 'Powerful. Precise. Automatic.',
        feats: [
          { val: 'UP TO 10M', lab: 'shooting range' },
          { val: '800 ML', lab: 'tank capacity' },
          { val: 'AUTO', lab: 'electric mode' },
          { val: 'SAFE', lab: 'and reliable' },
        ],
        cta: 'Shop now',
        socialStrong: '+99',
        socialSpan: 'Happy customers',
        glass: [
          { title: 'Fast delivery', sub: '4–6 days across Lithuania' },
          { title: 'Quality guarantee', sub: 'High-quality materials' },
          { title: 'Secure checkout', sub: 'Your data stays protected' },
        ],
        dotsLabel: 'Hero photos',
        dotLabel: (n: number) => `Slide ${n}`,
      };

  const len = HERO_SLIDE_SRC.length;
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const go = useCallback((n: number) => {
    setIdx((n % len + len) % len);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setIdx((i) => (i + 1) % len), SLIDE_INTERVAL_MS);
  }, [len]);

  const idxRef = useRef(0);
  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setIdx((i) => (i + 1) % len), SLIDE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [len]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      const cur = idxRef.current;
      if (dx > 0) go(cur + 1);
      else go(cur - 1);
    },
    [go]
  );

  return (
    <section className="wb-hero" aria-labelledby="wb-hero-heading">
      <div className="wb-hero-photo" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="wb-hero-photo-stack">
          {HERO_SLIDE_SRC.map((src, i) => {
            const isFirstSlide = i === 0;
            return (
              <img
                key={src}
                src={src}
                alt={i === idx ? slideAlts[i] : ''}
                aria-hidden={i !== idx}
                className={`wb-hero-photo-img ${i === idx ? 'wb-hero-photo-img--active' : ''}`}
                width={1600}
                height={1067}
                loading={isFirstSlide ? 'eager' : 'lazy'}
                fetchPriority={isFirstSlide ? 'high' : 'low'}
                decoding={isFirstSlide ? 'sync' : 'async'}
                draggable={false}
              />
            );
          })}
        </div>
        <div className="wb-hero-dots" role="tablist" aria-label={copy.dotsLabel}>
          {HERO_SLIDE_SRC.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === idx}
              tabIndex={i === idx ? 0 : -1}
              aria-label={copy.dotLabel(i + 1)}
              className={`wb-hero-dot ${i === idx ? 'wb-hero-dot--on' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>

      <div className="wb-hero-content">
        <div className="wb-hero-badge" role="img" aria-label={copy.badge}>
          <span aria-hidden>🔥</span> {copy.badge}
        </div>

        <h1 id="wb-hero-heading" className="wb-hero-title wb-heading-font">
          <span className="wb-hero-line-dark">{copy.lineDark}</span>
          <span className="wb-hero-line-blue">{copy.lineBlueA}</span>
          <span className="wb-hero-line-blue">{copy.lineBlueB}</span>
        </h1>

        <p className="wb-hero-sub wb-ui-font">{copy.sub}</p>

        <div className="wb-hero-features">
          {copy.feats.map((f, i) => (
            <div key={`feat-${i}`} className="wb-hero-feature">
              {FEATURE_ICONS[i]}
              <div className="wb-hero-feature-val wb-heading-font">{f.val}</div>
              {f.lab ? <div className="wb-hero-feature-label wb-ui-font">{f.lab}</div> : null}
            </div>
          ))}
        </div>

        <div className="wb-hero-cta-row">
          <button type="button" className="wb-btn-cta wb-btn-hero wb-heading-font" onClick={scrollToProducts}>
            {copy.cta}
            <WbShoppingBagIcon size={16} strokeWidth={2.5} />
          </button>

          <div className="wb-hero-social-proof wb-ui-font">
            <div className="wb-hero-avatars" aria-hidden>
              {HERO_SOCIAL_AVATARS.map((r) => (
                <HeroSocialAvatar key={r.name} originalSrc={r.image} title={r.name} />
              ))}
            </div>
            <div className="wb-hero-social-text">
              <strong>{copy.socialStrong}</strong>
              <span>{copy.socialSpan}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wb-hero-glass wb-ui-font">
        {copy.glass.map((row, gIdx) => (
          <div key={row.title} className="wb-hero-glass-item">
            <div className="wb-hero-gc-icon">
              {gIdx === 0 ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ) : gIdx === 1 ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <path d="M1 10h22" />
                </svg>
              )}
            </div>
            <div>
              <div className="wb-hero-gc-title wb-heading-font">{row.title}</div>
              <div className="wb-hero-gc-sub">{row.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
