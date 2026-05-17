import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SocialProofToastProps {
  checkoutOpen: boolean;
  isMobile: boolean;
  /** Sync with PDP scarcity; when set, stock message uses this number. */
  displayedStockLeft?: number;
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function getVilniusHour(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vilnius',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const h = parts.find((p) => p.type === 'hour')?.value;
  const n = parseInt(h ?? '12', 10);
  return Number.isFinite(n) ? Math.min(23, Math.max(0, n)) : 12;
}

function lithuanijaItinTyla() {
  const h = getVilniusHour();
  return h >= 3 && h < 8;
}

function lithuanijaDiena() {
  const h = getVilniusHour();
  return h >= 8 && h < 22;
}

function randViewersLt() {
  if (lithuanijaItinTyla()) return rand(1, 5);
  if (lithuanijaDiena()) return rand(14, 40);
  return rand(2, 12);
}

const CITIES_WEIGHTED: { label: string; w: number }[] = [
  { label: 'Vilniaus', w: 5 },
  { label: 'Kauno', w: 4 },
  { label: 'Klaipėdos', w: 3 },
  { label: 'Šiaulių', w: 2 },
  { label: 'Panevėžio', w: 2 },
  { label: 'Alytaus', w: 2 },
  { label: 'Marijampolės', w: 2 },
  { label: 'Mažeikių', w: 2 },
  { label: 'Utenos', w: 2 },
  { label: 'Telšių', w: 1 },
  { label: 'Ukmergės', w: 1 },
  { label: 'Kretingos', w: 1 },
  { label: 'Palangos', w: 1 },
  { label: 'Radviliškio', w: 1 },
  { label: 'Tauragės', w: 1 },
];

function pickCity(): string {
  const total = CITIES_WEIGHTED.reduce((s, c) => s + c.w, 0);
  let r = Math.random() * total;
  for (const row of CITIES_WEIGHTED) {
    r -= row.w;
    if (r <= 0) return row.label;
  }
  return CITIES_WEIGHTED[CITIES_WEIGHTED.length - 1]!.label;
}

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Returns the correct Lithuanian noun form based on the number.
 * form1 = singular (1)       → žmogus
 * form2 = plural nom. (2–9)  → žmonės
 * form3 = plural gen. (0, 10–20, multiples of 10) → žmonių
 */
function lt(n: number, form1: string, form2: string, form3: string): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 10 && mod100 <= 20) return form3;
  if (mod10 === 1) return form1;
  if (mod10 >= 2 && mod10 <= 9) return form2;
  return form3;
}

const DYNAMIC_KINDS = ['buyers', 'viewers', 'package'] as const;
type ToastSlice =
  | { kind: 'buyers'; icon: string; buyers: number }
  | { kind: 'viewers'; icon: string }
  | { kind: 'package'; icon: string; mins: number; city: string }
  | { kind: 'stock'; icon: string; text: string };

function stockSlice(displayedStockLeft?: number): ToastSlice {
  const stockText =
    displayedStockLeft != null && Number.isFinite(displayedStockLeft)
      ? `Liko tik ${displayedStockLeft} vnt`
      : 'Liko tik keli vienetai';
  return { kind: 'stock', icon: '⚡', text: stockText };
}

let lastDynamicIndex = -1;

function rollPinnedNums() {
  let buyers: number;
  if (lithuanijaItinTyla()) buyers = rand(1, 2);
  else if (lithuanijaDiena()) buyers = rand(5, 11);
  else buyers = rand(2, 5);
  return {
    buyers,
    packageMins: rand(2, 19),
    packageCity: pickCity(),
  };
}

function buildDynamicToast(pinned: { buyers: number; packageMins: number; packageCity: string }): ToastSlice {
  const n = DYNAMIC_KINDS.length;
  let idx: number;
  let guard = 0;
  do {
    idx = Math.floor(Math.random() * n);
    guard += 1;
  } while (idx === lastDynamicIndex && n > 1 && guard < 48);
  lastDynamicIndex = idx;
  const dk = DYNAMIC_KINDS[idx]!;
  if (dk === 'buyers')
    return { kind: 'buyers', icon: '🔥', buyers: pinned.buyers };
  if (dk === 'viewers')
    return { kind: 'viewers', icon: '👁️' };
  return {
    kind: 'package',
    icon: '📦',
    mins: pinned.packageMins,
    city: pinned.packageCity,
  };
}

function pickNextToast(
  pinned: { buyers: number; packageMins: number; packageCity: string },
  stock: ToastSlice,
  lastKindRef: React.MutableRefObject<ToastSlice['kind'] | null>,
): ToastSlice {
  const forbid = lastKindRef.current;
  let guard = 0;
  while (guard < 40) {
    guard += 1;
    const wantsStock = Math.random() < 0.26;
    let candidate: ToastSlice;
    if (wantsStock && forbid !== 'stock') candidate = stock;
    else candidate = buildDynamicToast(pinned);
    if (forbid === null || candidate.kind !== forbid) return candidate;
  }
  return buildDynamicToast(pinned);
}

function sliceLine(slice: ToastSlice, viewersNow: number): string {
  if (slice.kind === 'buyers')
    return `${slice.icon} ${slice.buyers} ${lt(slice.buyers, 'žmogus', 'žmonės', 'žmonių')} pirko per pastarąją valandą`;
  if (slice.kind === 'viewers')
    return `${slice.icon} ${viewersNow} ${lt(viewersNow, 'žmogus', 'žmonės', 'žmonių')} šiuo metu žiūri`;
  if (slice.kind === 'package')
    return `${slice.icon} Pirktas prieš ${slice.mins} min iš ${slice.city}`;
  return `${slice.icon} ${slice.text}`;
}

function progressKey(slice: ToastSlice | null, displayMs: number): string {
  if (!slice || slice.kind === 'stock')
    return slice ? `${slice.kind}-${slice.text}-${displayMs}` : '';
  if (slice.kind === 'buyers')
    return `buyers-${slice.buyers}-${displayMs}`;
  if (slice.kind === 'package')
    return `package-${slice.mins}-${slice.city}-${displayMs}`;
  return `viewers-${displayMs}`;
}

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  checkoutOpen,
  isMobile,
  displayedStockLeft,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [slice, setSlice] = useState<ToastSlice | null>(null);
  const [displayMs, setDisplayMs] = useState(3000);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [pinned, setPinned] = useState(rollPinnedNums);
  const [viewerCount, setViewerCount] = useState(() => randViewersLt());

  const startTimerRef = useRef<number | null>(null);
  const phaseOutTimerRef = useRef<number | null>(null);
  const afterOutTimerRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const slowPinsTimerRef = useRef<number | null>(null);

  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;

  const lastShownKindRef = useRef<ToastSlice['kind'] | null>(null);

  const eligible = !dismissed && !checkoutOpen;

  const stockSliceStable = useMemo(() => stockSlice(displayedStockLeft), [displayedStockLeft]);
  const stockRef = useRef(stockSliceStable);
  stockRef.current = stockSliceStable;

  const clearCarouselTimersOnly = () => {
    [startTimerRef, phaseOutTimerRef, afterOutTimerRef, pauseTimerRef].forEach((r) => {
      if (r.current !== null) {
        window.clearTimeout(r.current);
        r.current = null;
      }
    });
  };

  useEffect(() => {
    if (!eligible) return undefined;
    const tickViewers = () => setViewerCount(randViewersLt());

    tickViewers();
    const id = window.setInterval(tickViewers, 10000);
    return () => window.clearInterval(id);
  }, [eligible]);

  const scheduleSlowPins = useCallback(() => {
    if (slowPinsTimerRef.current !== null) {
      window.clearTimeout(slowPinsTimerRef.current);
      slowPinsTimerRef.current = null;
    }

    function tick() {
      setPinned(rollPinnedNums());
      slowPinsTimerRef.current = window.setTimeout(tick, rand(10, 15) * 60 * 1000);
    }
    slowPinsTimerRef.current = window.setTimeout(tick, rand(10, 15) * 60 * 1000);
  }, []);

  useEffect(() => {
    if (!eligible) {
      if (slowPinsTimerRef.current !== null) {
        window.clearTimeout(slowPinsTimerRef.current);
        slowPinsTimerRef.current = null;
      }
      lastDynamicIndex = -1;
      lastShownKindRef.current = null;
      clearCarouselTimersOnly();
      setVisible(false);
      setSlice(null);
      setPhase('in');
      return undefined;
    }

    scheduleSlowPins();
    return () => {
      if (slowPinsTimerRef.current !== null) {
        window.clearTimeout(slowPinsTimerRef.current);
        slowPinsTimerRef.current = null;
      }
    };
  }, [eligible, scheduleSlowPins]);

  useEffect(() => {
    if (!eligible) {
      lastDynamicIndex = -1;
      lastShownKindRef.current = null;
      clearCarouselTimersOnly();
      setVisible(false);
      setSlice(null);
      setPhase('in');
      return undefined;
    }

    let cancelled = false;

    const showStep = () => {
      if (cancelled) return;
      const displayFor = rand(2600, 3400);
      const pauseAfter = rand(2600, 4200);

      const next = pickNextToast(pinnedRef.current, stockRef.current, lastShownKindRef);
      lastShownKindRef.current = next.kind;
      setDisplayMs(displayFor);
      setSlice(next);
      setPhase('in');
      setVisible(true);

      const fadeOutStart = Math.max(120, displayFor - 280);
      phaseOutTimerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setPhase('out');
        afterOutTimerRef.current = window.setTimeout(() => {
          if (cancelled) return;
          setVisible(false);
          pauseTimerRef.current = window.setTimeout(showStep, pauseAfter);
        }, 280);
      }, fadeOutStart);
    };

    clearCarouselTimersOnly();
    startTimerRef.current = window.setTimeout(showStep, 0);

    return () => {
      cancelled = true;
      clearCarouselTimersOnly();
    };
  }, [eligible]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    clearCarouselTimersOnly();
  };

  const containerStyle = useMemo<React.CSSProperties>(() => ({
    position: 'fixed',
    left: isMobile ? 10 : 16,
    right: 'auto',
    bottom: isMobile ? 'calc(88px + env(safe-area-inset-bottom, 0px))' : 24,
    zIndex: 45,
    maxWidth: isMobile ? 260 : 360,
    pointerEvents: visible ? 'auto' : 'none',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 320ms ${SPRING}, transform 320ms ${SPRING}`,
  }), [isMobile, visible]);

  if (!eligible) return null;

  const pk = progressKey(slice, displayMs);
  const lineShown = slice ? sliceLine(slice, viewerCount) : '';

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
        <div className={`flex items-center shrink-0 ${isMobile ? 'gap-1.5 pl-2 pr-1.5 py-1.5' : 'gap-3 pl-3 pr-2 py-2.5'}`}>
          <span className={`relative flex items-center justify-center shrink-0 ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}>
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
            {lineShown}
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
        {slice ? (
          <span
            key={pk}
            aria-hidden
            className="absolute left-0 bottom-0 h-0.5 w-full origin-left"
            style={{
              backgroundImage: 'var(--gradient-cta-ui)',
              backgroundSize: '240% 100%',
              backgroundPosition: 'left center',
              animation: `sp-progress ${displayMs}ms linear forwards`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

SocialProofToast.displayName = 'SocialProofToast';

export default SocialProofToast;
