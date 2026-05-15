import React from 'react';
import { MYSTERY_GIFT } from '../data/mysteryGift';

interface MysteryGiftUpsellProps {
  isInCart: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const MysteryGiftUpsell: React.FC<MysteryGiftUpsellProps> = ({ isInCart, onAdd, onRemove }) => {
  const handleClick = () => {
    if (isInCart) onRemove();
    else onAdd();
  };

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
      <style>{`
        .mgu-card { transition: background-color 240ms ${SPRING}, border-color 240ms ${SPRING}; }
        .mgu-btn {
          transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
        }
        .mgu-btn:hover { background-color: #F5631A !important; color: #ffffff !important; border-color: #F5631A !important; }
      `}</style>

      <div
        className="mgu-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 10px 12px 12px',
          borderRadius: 12,
          backgroundColor: isInCart ? '#f0fdf4' : '#f9fafb',
          border: `1px solid ${isInCart ? '#bbf7d0' : '#e5e7eb'}`,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 50,
            height: 50,
            flexShrink: 0,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <img
            src={MYSTERY_GIFT.image}
            alt=""
            width={50}
            height={50}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'scale(1.18)',
              transformOrigin: 'center center',
              display: 'block',
            }}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a' }}>Mystery Dovana</h3>
            <span style={{ fontSize: 11.5, color: '#9ca3af', textDecoration: 'line-through' }}>
              €{MYSTERY_GIFT.originalPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#F5631A' }}>
              €{MYSTERY_GIFT.price.toFixed(2)}
            </span>
          </div>
          <p
            className={isInCart ? 'text-emerald-700' : undefined}
            style={{
              fontSize: isInCart ? 10.5 : 11.5,
              marginTop: 2,
              color: isInCart ? undefined : '#6b7280',
              fontWeight: isInCart ? 700 : 500,
              whiteSpace: isInCart ? 'nowrap' : undefined,
              lineHeight: 1.25,
            }}
          >
            {isInCart ? '✓ Nemokamas pristatymas įtrauktas!' : '+ gauk nemokamą pristatymą'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="mgu-btn"
          style={{
            flexShrink: 0,
            height: 34,
            padding: '0 14px',
            fontSize: 12.5,
            fontWeight: 700,
            borderRadius: 8,
            border: `1px solid ${isInCart ? '#d1d5db' : '#d1d5db'}`,
            backgroundColor: isInCart ? 'transparent' : '#ffffff',
            color: isInCart ? '#6b7280' : '#1a1a1a',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {isInCart ? '✕ Pašalinti' : 'Pridėti'}
        </button>
      </div>
    </div>
  );
};

MysteryGiftUpsell.displayName = 'MysteryGiftUpsell';

export default MysteryGiftUpsell;
