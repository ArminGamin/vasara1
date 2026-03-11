import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';

interface StickyMobileCTAProps {
  totalItems: number;
  onCartClick: () => void;
}

export function StickyMobileCTA({ totalItems, onCartClick }: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const show = window.scrollY > 200 && window.innerWidth <= 768;
        setVisible(show);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-brand-orange text-white shadow-lg safe-area-pb"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={onCartClick}
          className="flex items-center gap-2 font-bold text-white min-h-[48px]"
        >
          <ShoppingCart className="w-6 h-6" />
          <span>Krepšelis</span>
          {totalItems > 0 && (
            <span className="bg-white text-brand-orange rounded-full min-w-[22px] h-[22px] flex items-center justify-center text-sm">
              {totalItems}
            </span>
          )}
        </button>
        <a
          href="#products"
          className="flex-1 bg-white text-brand-orange font-bold py-3 px-4 rounded-xl text-center min-h-[48px] flex items-center justify-center"
        >
          Žiūrėti produktus
        </a>
      </div>
    </div>
  );
}
