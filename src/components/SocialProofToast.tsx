import React, { useEffect, useMemo, useRef, useState } from 'react';

interface SocialProofToastProps {
  cartCount: number;
  checkoutOpen: boolean;
  isMobile: boolean;
  /** Sync with PDP scarcity; when set, stock message uses this number. */
  displayedStockLeft?: number;
}

const BASE_MESSAGES = [
  '🔥 3 žmonės pirko per pastarąją valandą',
  '👁️ 12 žmonių šiuo metu žiūri',
  '📦 Pirktas prieš 8 min iš Vilniaus',
] as const;

function buildMessages(displayedStockLeft?: number): readonly string[] {
  const stockLine =
    displayedStockLeft != null && Number.isFinite(displayedStockLeft)
      ? `⚡ Liko tik ${displayedStockLeft} vnt`
      : '⚡ Liko tik keli vienetai';
  return [
    BASE_MESSAGES[0],
    BASE_MESSAGES[1],
    stockLine,
    BASE_MESSAGES[2],
  ];
}

const SHOW_DELAY_MS = 3000;
const CYCLE_MS = 5000;
const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  cartCount,
  checkoutOpen,
  isMobile,
  displayedStockLeft,
}) => {
  const messages = useMemo(
    () => buildMessages(displayedStockLeft),
    [displayedStockLeft],
  );
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const delayTimer = useRef<number | null>(null);
  const cycleTimer = useRef<number | null>(null);
  const outTimer = useRef<number | null>(null);

  const eligible = !dismissed && !checkoutOpen && cartCount > 0;

  useEffect(() => {
    setIndex((i) => Math.min(i, messages.length - 1));
  }, [messages]);

  useEffect(() => {
    if (!eligible) {
      setVisible(false);
      setPhase('in');
      if (delayTimer.current) window.clearTimeout(delayTimer.current);
      if (cycleTimer.current) window.clearInterval(cycleTimer.current);
      if (outTimer.current) window.clearTimeout(outTimer.current);
      return;
    }

    const delayMs = isMobile ? 0 : SHOW_DELAY_MS;
    delayTimer.current = window.setTimeout(() => {
      setVisible(true);
      cycleTimer.current = window.setInterval(() => {
        setPhase('out');
        outTimer.current = window.setTimeout(() => {
          setIndex(i => (i + 1) % messages.length);
          setPhase('in');
        }, 280);
      }, CYCLE_MS);
    }, delayMs);

    return () => {
      if (delayTimer.current) window.clearTimeout(delayTimer.current);
      if (cycleTimer.current) window.clearInterval(cycleTimer.current);
      if (outTimer.current) window.clearTimeout(outTimer.current);
    };
  }, [eligible, messages.length, isMobile]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  const containerStyle = useMemo<React.CSSProperties>(() => ({
    position: 'fixed',
    left: isMobile ? 10 : 16,
    right: 'auto',
    bottom: isMobile
      ? 'calc(88px + env(safe-area-inset-bottom, 0px))'
      : 24,
    zIndex: 45,
    maxWidth: isMobile ? 260 : 360,
    pointerEvents: visible ? 'auto' : 'none',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 320ms ${SPRING}, transform 320ms ${SPRING}`,
  }), [isMobile, visible]);

  if (!eligible) return null;

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <style>{`
        @keyframes sp-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes sp-pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes sp-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
      <div
        className={`relative overflow-hidden rounded-full ${isMobile ? 'shadow-lg' : 'shadow-2xl'}`}
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <div
          className={`flex items-center shrink-0 ${isMobile ? 'gap-1.5 pl-2 pr-1.5 py-1.5' : 'gap-3 pl-3 pr-2 py-2.5'}`}
        >
          <span
            className={`relative flex items-center justify-center shrink-0 ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: '#22C55E', animation: `sp-pulse-ring 1.6s ${SPRING} infinite` }}
            />
            <span
              className={`relative rounded-full ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
              style={{ backgroundColor: '#22C55E', animation: `sp-pulse 1.6s ${SPRING} infinite` }}
            />
          </span>
          <span
            className={`text-white font-medium leading-snug truncate ${isMobile ? 'text-[11px]' : 'text-sm'}`}
            style={{
              opacity: phase === 'in' ? 1 : 0,
              transform: phase === 'in' ? 'translateY(0)' : 'translateY(-6px)',
              transition: `opacity 280ms ${SPRING}, transform 280ms ${SPRING}`,
            }}
          >
            {messages[index]}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Užverti"
            className={`ml-auto flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 shrink-0 ${isMobile ? 'w-6 h-6' : 'w-7 h-7'}`}
          >
            <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <span
          key={index}
          aria-hidden
          className="absolute left-0 bottom-0 h-0.5 w-full origin-left"
          style={{
            backgroundColor: '#F97316',
            animation: `sp-progress ${CYCLE_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

SocialProofToast.displayName = 'SocialProofToast';

export default SocialProofToast;
