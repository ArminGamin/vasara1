import React from 'react';
import PageWrapper from '../components/PageWrapper';

export default function Kontaktai() {
  return (
    <PageWrapper title="Kontaktai" description="Susisiekite su Vasaros Kampeliu. El. paštas vasaroskampelis@gmail.com. Atsakome per 24 valandas.">
      <div className="text-brand-muted space-y-6">
        <h2 className="text-xl font-bold text-brand-blue-deep">Susisiekite su mumis!</h2>
        <p className="font-medium">Klausimams apie užsakymus, pristatymą ar prekes - rašykite.</p>
        <p><strong className="text-brand-text">El. paštas:</strong>{' '}
          <a href="mailto:vasaroskampelis@gmail.com" className="text-brand-blue-deep underline">vasaroskampelis@gmail.com</a>
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
        </span>
      </div>
    </PageWrapper>
  );
}
