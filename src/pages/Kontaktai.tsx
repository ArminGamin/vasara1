import React from 'react';
import PageWrapper from '../components/PageWrapper';

export default function Kontaktai() {
  return (
    <PageWrapper title="Kontaktai" description="Susisiekite su Vasaros Kampeliu. El. paštas info@vasaroskampelis.com. Atsakome per 24 valandas.">
      <div className="text-brand-muted space-y-6">
        <h2 className="text-xl font-bold text-brand-blue-deep">Susisiekite su mumis</h2>
        <p className="font-medium">Klausimams apie užsakymus, pristatymą ar prekes - rašykite.</p>
        <p><strong className="text-brand-text">El. paštas:</strong>{' '}
          <a href="mailto:info@vasaroskampelis.lt" className="text-brand-blue-deep underline">info@vasaroskampelis.lt</a>
        </p>
        <p><strong className="text-brand-text">Atsakome:</strong> <span className="font-medium">per 24 valandas.</span></p>
        <p><strong className="text-brand-text">Socialiniai tinklai:</strong></p>
        <span className="inline-flex flex-wrap items-center gap-4 mt-2">
          <a href="https://www.tiktok.com/@vasaroskampelis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-blue-deep underline hover:text-brand-orange [&_img]:hover:opacity-80" aria-label="TikTok">
            <img src="https://cdn.simpleicons.org/tiktok/0ea5e9" alt="" width="20" height="20" className="shrink-0" aria-hidden />
            TikTok
          </a>
          <a href="https://www.instagram.com/vasaroskampelis/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-blue-deep underline hover:text-brand-orange" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            Instagram
          </a>
          <a href="https://facebook.com/vasaroskampelis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-blue-deep underline hover:text-brand-orange" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
        </span>
      </div>
    </PageWrapper>
  );
}
