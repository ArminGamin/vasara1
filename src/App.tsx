import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from "react";
import {
  ShoppingCart,
  Heart,
  Menu,
  X,
  Star,
  Mail,
  Instagram,
  Headphones,
  Trash2,
  Check,
  Package,
  CreditCard,
  Lock,
  Share2,
  Clock,
  Users,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Gift,
  ArrowRight,
} from "lucide-react";
import { Routes, Route, Link, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import OptimizedImage from "./components/OptimizedImage";
import { LazyVideo } from "./components/LazyVideo";
// Loaded on idle via simple state gating below to avoid layout thrash
import { useCartStore } from "./store/cartStore";
import { useProductStore } from "./store/productStore";
import { initialProducts } from "./data/products";
import { MYSTERY_GIFT } from "./data/mysteryGift";
import { BRAND } from "./config/brand";
import { STOREFRONT_REVIEWS, REVIEW_IMAGE_FALLBACK } from "./data/storefrontReviews";
import { SITE_NAME, DEFAULT_DESC } from './components/PageWrapper';
// Lazy-load below-fold components – defers framer-motion and reduces main-thread work
const MysteryGiftUpsell = lazy(() => import("./components/MysteryGiftUpsell").then((m) => ({ default: m.MysteryGiftUpsell })));
const SocialProofToast = lazy(() => import("./components/SocialProofToast").then((m) => ({ default: m.SocialProofToast })));
const ReviewsSection = lazy(() => import("./components/ReviewsSection").then((m) => ({ default: m.ReviewsSection })));
const FAQAccordion = lazy(() => import("./components/FAQAccordion").then((m) => ({ default: m.FAQAccordion })));
const CookieConsent = lazy(() => import("./components/CookieConsent").then((m) => ({ default: m.default })));
const LanguageDetectionPopup = lazy(() => import("./components/LanguageDetectionPopup").then((m) => ({ default: m.LanguageDetectionPopup })));
const ComparisonTable = lazy(() => import("./components/ComparisonTable").then((m) => ({ default: m.ComparisonTable })));
const WhyChooseUs = lazy(() => import("./components/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })));
const EmailCapturePopup = lazy(() => import("./components/EmailCapturePopup").then((m) => ({ default: m.EmailCapturePopup })));
const StickyMobileCTA = lazy(() => import("./components/StickyMobileCTA").then((m) => ({ default: m.StickyMobileCTA })));
const ThankYouModal = lazy(() => import("./components/ThankYouModal").then((m) => ({ default: m.ThankYouModal })));
const CheckoutStripeLoader = lazy(() => import("./components/CheckoutStripeLoader").then((m) => ({ default: m.default })));

const STRIPE_PK = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;

// Lazy load non-critical components for code splitting
const ProductComparison = lazy(() => import("./components/ProductComparison").then(module => ({ default: module.ProductComparison })));

// Lazy-load route-level pages (info, blog) to shrink main bundle
const PristatymoInfo = lazy(() => import("./pages/PristatymoInfo").then(m => ({ default: m.default })));
const Grazinimai = lazy(() => import("./pages/Grazinimai").then(m => ({ default: m.default })));
const PrivatumoPolitika = lazy(() => import("./pages/PrivatumoPolitika").then(m => ({ default: m.default })));
const SlapukuPolitika = lazy(() => import("./pages/SlapukuPolitika").then(m => ({ default: m.default })));
const Kontaktai = lazy(() => import("./pages/Kontaktai").then(m => ({ default: m.default })));
const ApieMus = lazy(() => import("./pages/ApieMus").then(m => ({ default: m.default })));
const BlogIndex = lazy(() => import("./pages/BlogIndex").then(m => ({ default: m.default })));
const BlogPostVasaraNamuose = lazy(() => import("./pages/blog/BlogPostVasaraNamuose").then(m => ({ default: m.default })));
const BlogPostVasarosPasiulymai2025 = lazy(() => import("./pages/blog/BlogPostVasarosPasiulymai2025").then(m => ({ default: m.default })));
const BlogPostKiemasVandens = lazy(() => import("./pages/blog/BlogPostKiemasVandens").then(m => ({ default: m.default })));
const BlogPost10BuduVasara = lazy(() => import("./pages/blog/BlogPost10BuduVasara").then(m => ({ default: m.default })));
const BlogPostVasaraBeStreso = lazy(() => import("./pages/blog/BlogPostVasaraBeStreso").then(m => ({ default: m.default })));
const BlogPostVandensMusiai = lazy(() => import("./pages/blog/BlogPostVandensMusiai").then(m => ({ default: m.default })));
const BlogPostVandensZaidimaiVaikams = lazy(() => import("./pages/blog/BlogPostVandensZaidimaiVaikams").then(m => ({ default: m.default })));
const BlogPostKaipIssirinktiBlasteri = lazy(() => import("./pages/blog/BlogPostKaipIssirinktiBlasteri").then(m => ({ default: m.default })));
const BlogPostPiknikoIdejos = lazy(() => import("./pages/blog/BlogPostPiknikoIdejos").then(m => ({ default: m.default })));
const BlogPostGimtadienisLaukeVaikams = lazy(() => import("./pages/blog/BlogPostGimtadienisLaukeVaikams").then(m => ({ default: m.default })));
const BlogPostKaVeiktiSuVaikaisVasara = lazy(() => import("./pages/blog/BlogPostKaVeiktiSuVaikaisVasara").then(m => ({ default: m.default })));
const BlogPostVandensSautuvasVsPistoletas = lazy(() => import("./pages/blog/BlogPostVandensSautuvasVsPistoletas").then(m => ({ default: m.default })));
const BlogPostVasarosDovanosVaikams = lazy(() => import("./pages/blog/BlogPostVasarosDovanosVaikams").then(m => ({ default: m.default })));

function heroSrcSet(base: string) {
  const b = base.replace(/\.webp$/, '');
  return `${b}-480w.webp 480w, ${b}-768w.webp 768w, ${b}-1024w.webp 1024w, ${base} 1920w`;
}
// Product images (blue1.webp, pink2.webp, etc.) have 240/306/512/612/1024w variants from prebuild
const PRODUCT_WIDTHS = [240, 306, 512, 612, 1024];
function productSrcSet(path: string): string | undefined {
  const normalized = path.startsWith('/') ? path : '/' + path;
  if (!/^\/(blue|pink|bluepistol|pinkpistol)\d+\.webp$/i.test(normalized)) return undefined;
  const base = normalized.replace(/\.webp$/i, '');
  return PRODUCT_WIDTHS.map((w) => `${base}-${w}w.webp ${w}w`).join(', ');
}
function productSmallestSrc(path: string): string {
  const normalized = path.startsWith('/') ? path : '/' + path;
  if (!/^\/(blue|pink|bluepistol|pinkpistol)\d+\.webp$/i.test(normalized)) return normalized;
  return normalized.replace(/\.webp$/i, `-${PRODUCT_WIDTHS[0]}w.webp`);
}

const PDP_STOCK_CAP = 24;

function computePdpCombinedIndex(
  sizeGroups: { sizes?: { name: string; value: string }[] }[],
  sectionSizesByGroup: number[]
): number {
  const typeIdx = sectionSizesByGroup[0] ?? 0;
  const colorIdx = sectionSizesByGroup[1] ?? 0;
  if (sizeGroups.length >= 2) {
    return typeIdx * (sizeGroups[1]?.sizes?.length ?? 1) + colorIdx;
  }
  return typeIdx;
}

function computePdpStockLeft(combinedIndex: number): number {
  return Math.max(3, PDP_STOCK_CAP - (combinedIndex * 3 + 8));
}

function computePdpStockPct(stockLeft: number): number {
  return Math.min(100, Math.max(8, Math.round((stockLeft / PDP_STOCK_CAP) * 100)));
}

function formatCheckoutLeaveTimer(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
const HERO_IMAGES = [
  { src: '/hero-pink-ar.webp', alt: 'Elektrinis vandens šautuvas – rožinis' },
  { src: '/hero-blue-ar.webp', alt: 'Elektrinis vandens šautuvas – mėlynas' },
  { src: '/hero-pink-glock.webp', alt: 'Elektrinis vandens pistoletas – rožinis' },
  { src: '/hero-blue-glock.webp', alt: 'Elektrinis vandens pistoletas – mėlynas' },
];

const SWIPE_THRESHOLD = 50;

const HeroSlideshow = React.memo(function HeroSlideshow({ language }: { language: string }) {
  const [idx, setIdx] = useState(0);
  const len = HERO_IMAGES.length;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const go = useCallback((n: number) => {
    setIdx((n % len + len) % len);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setIdx(i => (i + 1) % len), 5000);
  }, [len]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setIdx(i => (i + 1) % len), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [len]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0) go(idx + 1);      // swipe left -> next
    else go(idx - 1);              // swipe right -> prev
  }, [idx, go]);

  return (
    <>
      <div
        className="hero-carousel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {HERO_IMAGES.map((img, i) => (
          <img
            key={i}
            src={img.src}
            srcSet={heroSrcSet(img.src)}
            sizes="100vw"
            alt={img.alt}
            className={`hero-carousel-img ${i === idx ? 'active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : undefined}
            draggable={false}
          />
        ))}
        <div className="hero-dots">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === idx ? 'on' : ''}`} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>
      <div className="hero-overlay">
        <div className="hero-overlay-inner">
          <h1 className="hero-overlay-title">
            {language === 'lt' ? 'Vasaros mūšis!' : 'Summer battle!'}
          </h1>
          <p className="hero-overlay-sub">
            {language === 'lt'
              ? '💦 Vandens šautuvai, kurie šaudo iki 10 metrų. Tikras veiksmas! 💥'
              : '💦 Water blasters that shoot up to 10m. Real action!'}
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="hero-overlay-cta"
          >
            {language === 'lt' ? 'PIRK DABAR' : 'SHOP NOW'}
          </button>
        </div>
      </div>
    </>
  );
});

const CART_DRAWER_REVIEW_NAMES = ['Tomas V.', 'Giedrė J.', 'Mantas K.', 'Rūta L.', 'Jonas P.'] as const;
const CART_DRAWER_REVIEWS = CART_DRAWER_REVIEW_NAMES.map((name) =>
  STOREFRONT_REVIEWS.find((r) => r.name === name)
).filter((r): r is (typeof STOREFRONT_REVIEWS)[number] => Boolean(r));

function CartReviewerAvatar({ originalSrc }: { originalSrc: string }) {
  const [src, setSrc] = useState(originalSrc);
  return (
    <img
      src={src}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      decoding="async"
      style={{ width: 28, height: 28, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }}
      onError={() => {
        const fb = REVIEW_IMAGE_FALLBACK[originalSrc];
        if (fb) setSrc(fb);
      }}
    />
  );
}

// --- Main Shop Page ---
function HomePage() {
  const location = useLocation();
  useEffect(() => {
    document.title = `${SITE_NAME} | Vandens šautuvai ir vasaros žaidimai Lietuvoje`;
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute('content', DEFAULT_DESC);
  }, []);
  const { items: cartItems, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  const { products } = useProductStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLeaveConfirmOpen, setCheckoutLeaveConfirmOpen] = useState(false);
  const [checkoutLeaveTimerSec, setCheckoutLeaveTimerSec] = useState(300);
  const [checkoutLiveBuyersCount, setCheckoutLiveBuyersCount] = useState(
    () => Math.floor(Math.random() * 14) + 4
  );
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  // For products that define multiple size groups (e.g., Adults, Kids)
  const [selectedSizesByGroup, setSelectedSizesByGroup] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [sectionSizesByGroup, setSectionSizesByGroup] = useState<number[]>([0, 0]);
  const [sectionImageIndex, setSectionImageIndex] = useState(0);
  const [sectionQuantity, setSectionQuantity] = useState(1);
  const [sectionAddSuccess, setSectionAddSuccess] = useState(false);
  const [sectionFeaturesExpanded, setSectionFeaturesExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});
  const [thankYouModalOpen, setThankYouModalOpen] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState('');
  const [completedOrderEmail, setCompletedOrderEmail] = useState('');
  // Non-critical visuals deferred to idle
  const [showCookie, setShowCookie] = useState(false);
  const cartReviewsScrollRef = useRef<HTMLDivElement>(null);
  const [cartReviewDotIndex, setCartReviewDotIndex] = useState(0);

  const scrollCartReviewToIndex = useCallback((i: number) => {
    const el = cartReviewsScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const card = el.children.item(i) as HTMLElement | null;
      if (!card) return;
      const targetLeft = card.offsetLeft;
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
      setCartReviewDotIndex(i);
    });
  }, []);

  const onCartReviewsScroll = useCallback(() => {
    const el = cartReviewsScrollRef.current;
    if (!el || el.children.length === 0) return;
    requestAnimationFrame(() => {
      // Batch every layout read into one rAF window to avoid forced reflow when scroll fires mid-paint.
      const n = el.children.length;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const left = el.scrollLeft;
      const tol = 4;
      let best = 0;
      if (maxScroll <= tol) {
        best = 0;
      } else if (left >= maxScroll - tol) {
        best = n - 1;
      } else if (left <= tol) {
        best = 0;
      } else {
        let bestDist = Infinity;
        for (let j = 0; j < n; j++) {
          const c = el.children.item(j) as HTMLElement;
          const dist = Math.abs(c.offsetLeft - left);
          if (dist < bestDist) {
            bestDist = dist;
            best = j;
          }
        }
      }
      setCartReviewDotIndex((prev) => (prev !== best ? best : prev));
    });
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    const el = cartReviewsScrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    setCartReviewDotIndex(0);
  }, [cartOpen]);

  // Free shipping threshold uses FLOOR of subtotal cents (no rounding up to qualify)
  const freeShippingCents = 8000; // €80.00
  const subtotalCentsFloor = useMemo(() => (
    cartItems.reduce((sum: number, it: any) => {
      const priceCentsFloor = Math.floor(Number(it.price) * 100);
      return sum + priceCentsFloor * Number(it.quantity || 1);
    }, 0)
  ), [cartItems]);
  const mysteryGiftCartItem = useMemo(
    () => cartItems.find((it: any) => it.productId === MYSTERY_GIFT.productId),
    [cartItems]
  );
  const mysteryInCart = Boolean(mysteryGiftCartItem);
  const isFreeShipping = subtotalCentsFloor >= freeShippingCents || mysteryInCart;
  const orderCents = useMemo(() => {
    const subtotalCents = cartItems.reduce((sum: number, it: any) => {
      const priceCents = Math.round(Number(it.price) * 100);
      return sum + priceCents * Number(it.quantity || 1);
    }, 0);
    const shippingCents = isFreeShipping ? 0 : 299; // €2.99 shipping
    const giftWrapCents = giftWrapping ? 299 : 0;   // €2.99 gift wrap (if enabled)
    return subtotalCents + shippingCents + giftWrapCents;
  }, [cartItems, isFreeShipping, giftWrapping]);

  // Defer some non-critical UI to idle to reduce main-thread contention
  useEffect(() => {
    const w = typeof window !== 'undefined' ? (window as any) : null;
    const schedule = (fn: () => void, timeout = 1500) => {
      if (w && 'requestIdleCallback' in w) {
        w.requestIdleCallback(fn, { timeout });
      } else {
        setTimeout(fn, timeout);
      }
    };
    schedule(() => setShowCookie(true), 1000);
  }, []);

  // Open product modal for /p/:id paths
  useEffect(() => {
    const match = location.pathname.match(/^\/p\/(\d+)/);
    if (match && products && products.length > 0) {
      const idNum = Number(match[1]);
      const p = products.find((pp: any) => pp.id === idNum);
      if (p) {
        setSelectedProduct(p);
        setSelectedImageIndex(0);
        setSelectedColor(0);
        setSelectedSize(0);
        setSelectedSizesByGroup(p.sizeGroups ? p.sizeGroups.map(() => 0) : []);
        setQuantity(1);
        setProductModalOpen(true);
      }
    }
  }, [location.pathname, products]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  // Per-route SEO injection removed per request
  const [checkoutFormData, setCheckoutFormData] = useState({
    email: '',
    name: '',
    surname: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  
  // Light-weight, network-aware prefetch of first image for products (limited to first 3)
  useEffect(() => {
    if (!products || products.length === 0) return;
    const nav: any = (typeof navigator !== 'undefined') ? (navigator as any) : null;
    if (nav?.connection?.saveData) return; // respect data saver
    const type = nav?.connection?.effectiveType || '';
    if (/(^|\\b)2g(\\b|$)/i.test(String(type))) return; // avoid on very slow networks

    const sources: string[] = products
      .slice(0, 3)
      .map((p: any) => p?.image || (p?.images && p.images[0]) || '')
      .filter(Boolean);

    let index = 0;
    const burst = () => {
      for (let k = 0; k < 3 && index < sources.length; k++, index++) {
        const src = sources[index];
        const img = new Image();
        (img as any).loading = 'eager';
        img.decoding = 'async';
        img.src = productSmallestSrc(src);
      }
      if (index < sources.length) setTimeout(burst, 200);
    };

    const w: any = typeof window !== 'undefined' ? window : null;
    if (w && 'requestIdleCallback' in w) {
      w.requestIdleCallback(burst, { timeout: 3000 });
    } else {
      setTimeout(burst, 1200);
    }
  }, [products]);
  // Urgency and scarcity features
  const [urgencyTimer, setUrgencyTimer] = useState({
    hours: 0,
    minutes: 45,
    seconds: 0,
  });
  const [viewersCount, setViewersCount] = useState(12);
  // Progressive product rendering for mobile - reduces main-thread work
  // Full product list rendering (no progressive slicing)

  // Sort products by lowest price first for listing grid
  const productsSorted = useMemo(() => {
    return [...products].sort((a: any, b: any) => Number(a.price) - Number(b.price));
  }, [products]);

  const pdpDisplayedStockLeft = useMemo(() => {
    const product = productsSorted[0];
    if (!product) return computePdpStockLeft(0);
    const sizeGroups = product.sizeGroups ?? [];
    const combinedIndex = computePdpCombinedIndex(sizeGroups, sectionSizesByGroup);
    return computePdpStockLeft(combinedIndex);
  }, [productsSorted, sectionSizesByGroup]);
  
  // Weighted random stock counter (3-15, lower numbers prioritized)
  const getWeightedStockCount = () => {
    // Create weighted array with more lower numbers
    const weights = [
      3, 3, 3, 3, 3,  // 3 appears 5 times (most common)
      4, 4, 4, 4,     // 4 appears 4 times
      5, 5, 5,        // 5 appears 3 times
      6, 6,           // 6 appears 2 times
      7, 7,           // 7 appears 2 times
      8,              // 8 appears 1 time
      9,              // 9 appears 1 time
      10, 11, 12, 13, 14, 15  // Higher numbers appear once
    ];
    return weights[Math.floor(Math.random() * weights.length)];
  };
  
  const [stockCount, setStockCount] = useState(getWeightedStockCount());
  const [recentOrders, setRecentOrders] = useState([
    { name: 'Jonas P.', location: 'Vilnius', time: '3 min', product: 'Vandens šautuvas' },
    { name: 'Eglė K.', location: 'Klaipėda', time: '7 min', product: 'Vandens blasteris' },
    { name: 'Darius R.', location: 'Šiauliai', time: '12 min', product: 'Vandens žaidimų rinkinys' },
    { name: 'Lina B.', location: 'Panevėžys', time: '15 min', product: 'Vandens pistoletas' },
    { name: 'Mantas S.', location: 'Alytus', time: '18 min', product: 'Blasterių rinkinys' },
    { name: 'Gintarė V.', location: 'Marijampolė', time: '22 min', product: 'Vandens šautuvas' },
    { name: 'Tomas M.', location: 'Utena', time: '25 min', product: 'Vandens blasteris' },
    { name: 'Rūta L.', location: 'Tauragė', time: '28 min', product: 'Vandens žaidimai' },
    { name: 'Arūnas K.', location: 'Telšiai', time: '31 min', product: 'Vandens šautuvai' },
    { name: 'Ieva N.', location: 'Mažeikiai', time: '35 min', product: 'Vandens pistoletai' },
  ]);

  // Ensure product cards show varied recent-order info without repeating the same entry
  const orderInfos = useMemo(() => {
    const arr = [...recentOrders];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }, [recentOrders]);

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [countdownExpired, setCountdownExpired] = useState(false);
  // Promo end date: set VITE_PROMO_END (e.g. "2025-08-31T23:59:59") or defaults to end of summer
  const promoEndDate = useMemo(() => {
    const env = (import.meta as any).env?.VITE_PROMO_END;
    if (env) return new Date(env);
    return new Date("2025-08-31T23:59:59");
  }, []);
  // Bridge ref to trigger Stripe payment from parent button
  const stripePayRef = React.useRef<null | (() => Promise<{ ok: boolean; error?: string }>)>(null);
  const orderIdRef = React.useRef<string | null>(null);
  // Scroll-snap slideshow: container ref + section refs for entrance animations
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  
  // Products initialized at app level (see ProductCatalogBootstrap) so catalog + prerender-ready are consistent on all routes

  // Translations – summer shop, LT + EN
  const [language, setLanguage] = useState<'lt' | 'en'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('splashzone-lang') as 'lt' | 'en' | null;
      if (stored === 'lt' || stored === 'en') return stored;
      // If Google Translate cookie is set, treat as EN (translation mode)
      const gt = document.cookie.match(/googtrans=([^;]+)/);
      if (gt && gt[1] !== '/lt/lt') return 'en';
    }
    return 'lt';
  });

  // Google Translate: load script when EN selected
  useEffect(() => {
    if (language !== 'en') return;
    if (document.getElementById('google-translate-script')) return;
    const s = document.createElement('script');
    s.id = 'google-translate-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }, [language]);

  const translations: Record<'lt' | 'en', Record<string, string>> = {
    lt: {
      saleBanner: 'Nemokamas pristatymas nuo 80€',
      shopName: 'Vasaros Kampelis',
      cart: 'Krepšelis',
      wishlist: 'Pageidavimų sąrašas',
      products: 'Šautuvai',
      recentlyViewed: 'Neseniai žiūrėti',
      addToCart: 'Įdėti į krepšelį',
      viewProduct: 'Peržiūrėti',
      checkout: 'Atsiskaityti',
      freeShipping: 'Nemokamas pristatymas',
      securePayment: 'Saugus mokėjimas',
      easyReturns: '30 dienų grąžinimas',
      support: 'Pagalba',
      christmasCountdown: 'Sezoninė nuolaida baigiasi',
      countdownSubtitle: 'Pasiūlymas ribotam laikui – gauk daugiau už mažesnę kainą!',
      days: 'D.',
      hours: 'Val.',
      minutes: 'Min.',
      seconds: 'Sek.',
      emptyCart: 'Krepšelis tuščias',
      continueShopping: 'Tęsti apsipirkimą',
      recommendations: 'Rekomenduojame',
      shareProduct: 'Dalintis',
      shareText: 'Pažiūrėk šį vandens blasterį!',
      giftWrapping: 'Dovanų pakavimas',
      orderTotal: 'Viso',
      subtotal: 'Tarpinė suma',
      shipping: 'Pristatymas',
      placeOrder: 'Pateikti užsakymą',
      lastOrder: 'Paskutinis užsakymas',
      processing: 'Apdorojama',
      addedToCart: 'Pridėta į krepšelį!',
      orderPlaced: 'Užsakymas pateiktas!',
      addedToWishlist: 'Pridėta į pageidavimų sąrašą',
      removedFromWishlist: 'Pašalinta iš pageidavimų sąrašo',
      happyCustomers: 'Patenkinti klientai',
      heroHeadline: 'Vasaros linksmys prasideda čia',
      heroSub: 'Galingi, saugūs vandens blasteriai – idealūs šeimai ir draugams. Nemokamas pristatymas nuo 80€.',
      ctaShop: 'Žiūrėti produktus',
      mostPopular: 'Populiauriausias',
      newBadge: 'NAUJA',
      guaranteeTitle: '30 dienų garantija',
      whyUs: 'Kodėl mes?',
      offerEnded: 'Pasiūlymas baigėsi',
      buyNow: 'Pirkti dabar',
      benefitCapacity: 'Didelė vandens talpa',
      benefitSafeKids: 'Saugus vaikams',
      benefitQuality: 'Kokybė ir atsparumas',
      benefitReturns: '30 dienų grąžinimas',
      pdpFeaturesMore: 'Daugiau',
      pdpFeaturesLess: 'Rodyti mažiau',
      checkoutLeaveTitle: 'Išeiti iš apmokėjimo?',
      checkoutLeaveBody: 'Jūsų įvesti duomenys nebus išsaugoti.',
      checkoutLeaveAlmostDone: 'Beveik baigta! 🚀',
      checkoutLeaveTitleMystery: 'Tavo mystery dovana beveik tavo!',
      checkoutLeaveBodyMystery: 'Užbaik užsakymą — staigmena jau krepšelyje laukia tavęs.',
      checkoutLeaveStay: 'Likti',
      checkoutLeaveStayMystery: 'NORIU SAVO DOVANOS!',
      checkoutLeaveStayCta: 'TĘSTI APMOKĖJIMĄ',
      checkoutLeaveExitMystery: 'Ačiū, man nereikia dovanų',
      checkoutLeaveSocialProof: 'Šiuo metu perka dar {n} žmonių',
      checkoutLeaveConfirm: 'Išeiti',
    },
    en: {
      saleBanner: 'Free shipping over €80',
      shopName: 'Vasaros Kampelis',
      cart: 'Cart',
      wishlist: 'Wishlist',
      products: 'Products',
      recentlyViewed: 'Recently viewed',
      addToCart: 'Add to cart',
      viewProduct: 'View',
      checkout: 'Checkout',
      freeShipping: 'Free shipping',
      securePayment: 'Secure payment',
      easyReturns: '30-day returns',
      support: 'Support',
      christmasCountdown: 'Seasonal offer ends soon',
      countdownSubtitle: 'Limited time – get more for less!',
      days: 'Days',
      hours: 'Hrs',
      minutes: 'Min',
      seconds: 'Sec',
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue shopping',
      recommendations: 'Recommended for you',
      shareProduct: 'Share',
      shareText: 'Check out this water blaster!',
      giftWrapping: 'Gift wrapping',
      orderTotal: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      placeOrder: 'Place order',
      lastOrder: 'Last order',
      processing: 'Processing',
      addedToCart: 'Added to cart!',
      orderPlaced: 'Order placed successfully!',
      addedToWishlist: 'Added to wishlist',
      removedFromWishlist: 'Removed from wishlist',
      happyCustomers: 'Happy customers',
      heroHeadline: 'Summer fun starts here',
      heroSub: 'Powerful, safe water blasters – perfect for family & friends. Free shipping over €80.',
      ctaShop: 'Shop now',
      mostPopular: 'Most popular',
      newBadge: 'NEW',
      guaranteeTitle: '30-day guarantee',
      whyUs: 'Why choose us?',
      offerEnded: 'Offer ended',
      buyNow: 'Buy now',
      benefitCapacity: 'Large water capacity',
      benefitSafeKids: 'Safe for kids',
      benefitQuality: 'Quality & durability',
      benefitReturns: '30-day returns',
      pdpFeaturesMore: 'Show more',
      pdpFeaturesLess: 'Show less',
      checkoutLeaveTitle: 'Leave checkout?',
      checkoutLeaveBody: 'Information you entered will not be saved.',
      checkoutLeaveAlmostDone: 'Almost there! 🚀',
      checkoutLeaveTitleMystery: 'Your mystery gift is almost yours!',
      checkoutLeaveBodyMystery: 'Finish checkout — your surprise is already in the cart.',
      checkoutLeaveStay: 'Stay',
      checkoutLeaveStayMystery: 'I WANT MY GIFT!',
      checkoutLeaveStayCta: 'CONTINUE CHECKOUT',
      checkoutLeaveExitMystery: 'No thanks, I don\u2019t need gifts',
      checkoutLeaveSocialProof: '{n} people are checking out right now',
      checkoutLeaveConfirm: 'Leave',
    },
  };

  const t = translations[language];
  const { products: storeProducts } = useProductStore();

  useEffect(() => {
    const intervalMs = 10 * 60 * 1000;
    const tick = () => setCheckoutLiveBuyersCount(Math.floor(Math.random() * 14) + 4);
    const id = window.setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, []);

  const closeCheckoutConfirmed = useCallback(() => {
    setCheckoutOpen(false);
    setCheckoutLeaveConfirmOpen(false);
  }, []);

  const requestCheckoutClose = useCallback(() => {
    setCheckoutLeaveConfirmOpen(true);
  }, []);

  useEffect(() => {
    if (!checkoutOpen) {
      setCheckoutLeaveConfirmOpen(false);
    }
  }, [checkoutOpen]);

  useEffect(() => {
    if (!checkoutLeaveConfirmOpen) return;
    setCheckoutLeaveTimerSec(300);
    const id = window.setInterval(() => {
      setCheckoutLeaveTimerSec((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [checkoutLeaveConfirmOpen]);

  useEffect(() => {
    if (!checkoutOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setCheckoutLeaveConfirmOpen((prev) => !prev);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checkoutOpen]);
  
  const renderStars = useCallback((_rating: number, size: string = 'w-4 h-4') => (
    <div className="flex text-brand-gold">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} fill-brand-gold`} />
      ))}
    </div>
  ), []);
  
  const resolveImagePath = useCallback((path: string) => {
    if (!path || path.startsWith('http')) return path;
    const base = (import.meta as any).env?.BASE_URL || '/';
    return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
  }, []);
  
  const validateEmail = (email: string) => {
    const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'yahoo.co.uk', 'hotmail.co.uk', 'outlook.co.uk'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    return validDomains.includes(domain);
  };

  const validateForm = (formData: any) => {
    const errors: any = {};
    const useStripeElements = true;
    
    // Email validation
    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = 'Įveskite galiojantį el. pašto adresą (gmail.com, yahoo.com, hotmail.com, outlook.com)';
    }
    
    // Name validation (letters only)
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Vardas yra privalomas (mažiausiai 2 raidės)';
    } else if (!/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$/.test(formData.name)) {
      errors.name = 'Vardas gali turėti tik raides';
    }
    
    // Surname validation (letters only)
    if (!formData.surname || formData.surname.trim().length < 2) {
      errors.surname = 'Pavardė yra privaloma (mažiausiai 2 raidės)';
    } else if (!/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$/.test(formData.surname)) {
      errors.surname = 'Pavardė gali turėti tik raides';
    }
    
    // Address validation
    if (!formData.address || formData.address.trim().length < 5) {
      errors.address = 'Įveskite pilną adresą';
    }
    
    // City validation (letters only)
    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = 'Miestas yra privalomas';
    } else if (!/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$/.test(formData.city)) {
      errors.city = 'Miesto pavadinimas gali turėti tik raides';
    }
    
    // Postal code validation (numbers only, 5 digits)
    if (!formData.postalCode) {
      errors.postalCode = 'Pašto kodas yra privalomas';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = 'Pašto kodas turi būti 5 skaitmenys';
    }
    
    // Phone validation (numbers, +, spaces, dashes)
    if (!formData.phone) {
      errors.phone = 'Telefonas yra privalomas';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?\d{9,15}$/.test(cleanPhone)) {
        errors.phone = 'Įveskite galiojantį telefono numerį (pvz., +37060000000)';
      }
    }
    
    // When using Stripe Elements, skip card fields validation (handled by Stripe)
    if (!useStripeElements) {
    if (!formData.cardNumber) {
      errors.cardNumber = 'Kortelės numeris yra privalomas';
    } else {
      const cleanCard = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cleanCard)) {
        errors.cardNumber = 'Kortelės numeris turi būti 16 skaitmenų';
      }
    }
    if (!formData.expiry) {
      errors.expiry = 'Galiojimo data yra privaloma';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      errors.expiry = 'Formatas turi būti MM/YY';
    } else {
      const [month, year] = formData.expiry.split('/');
      const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expDate < now) {
        errors.expiry = 'Kortelės galiojimas pasibaigęs';
      }
    }
    if (!formData.cvv) {
      errors.cvv = 'CVV yra privalomas';
    } else if (!/^\d{3}$/.test(formData.cvv)) {
      errors.cvv = 'CVV turi būti 3 skaitmenys';
      }
    }
    
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    setCheckoutFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const formatPhone = (value: string) => {
    // Allow only numbers, +, spaces, dashes, and parentheses
    return value.replace(/[^\d\+\s\-\(\)]/g, '');
  };

  const addToWishlist = useCallback((productId: number) => {
    setWishlist(prev => prev.includes(productId) 
      ? prev.filter(id => id !== productId)
      : [...prev, productId]
    );
    setSuccessMessage(wishlist.includes(productId) ? t.removedFromWishlist : t.addedToWishlist);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, [wishlist, t]);

  const shareProduct = (product: any) => {
    const shareUrl = window.location.href;
    const shareText = `${t.shareText} ${product.name} - €${product.price}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      
      const shareWindow = window.open('', '_blank', 'width=600,height=400');
      if (shareWindow) {
        shareWindow.document.write(`
          <html>
            <head><title>Share Product</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Share this product</h2>
              <p>${shareText}</p>
              <div style="margin-top: 20px;">
                <a href="${twitterUrl}" target="_blank" style="padding: 10px; background: #1da1f2; color: white; text-decoration: none; border-radius: 5px;">Share on Twitter</a>
              </div>
            </body>
          </html>
        `);
      }
    }
  };

  const recommendations = useMemo(() => 
    products.filter(product => !wishlist.includes(product.id)).slice(0, 3)
  , [products, wishlist]);

  const addToRecentlyViewed = useCallback((productId: number) => {
    setRecentlyViewed(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 3));
  }, []);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = promoEndDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdownExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdownExpired(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [promoEndDate]);

  // Scroll-snap: add is-visible to sections when they enter the scroll container (respects prefers-reduced-motion in CSS)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const refs = sectionRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: container, threshold: 0.05, rootMargin: "0px 0px 0px 0px" }
    );
    refs.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Mobile detection and touch handlers
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isMobile || touchStart === null || touchEnd === null || touchStartY === null || touchEndY === null) return;

    const dx = touchStart - touchEnd; // positive = left swipe
    const dy = touchStartY - touchEndY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Require a strong horizontal intent to avoid triggering on vertical scroll
    const strongHorizontal = absDx > 80 && absDx > absDy * 1.5;
    if (!strongHorizontal) return;

    const isLeftSwipe = dx > 0;
    const isRightSwipe = dx < 0;
    const nearLeftEdge = touchStart < 40;
    const nearRightEdge = touchStart > (window.innerWidth - 40);

    if (isLeftSwipe && cartOpen && nearRightEdge) setCartOpen(false);
    if (isRightSwipe && !cartOpen && nearLeftEdge) setCartOpen(true);
  };

  // Prevent scroll when modal is open on mobile
  useEffect(() => {
    if (isMobile && (productModalOpen || cartOpen)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, productModalOpen, cartOpen]);

  // Lazy-load the product modal stylesheet on first open – keeps ~5 KB of CSS off initial load
  useEffect(() => {
    if (!productModalOpen) return;
    import('./styles/product-modal.css').catch(() => {});
  }, [productModalOpen]);

  // Tab title: when user switches to another tab, flash between site name and "come back" message
  const TAB_TITLE_DEFAULT = 'Vasaros Kampelis | Vandens šautuvai ir vasaros žaidimai';
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const comeBackTitle = language === 'lt' ? '👀 Jau išeini?' : 'Come back soon! 💦';
        let showComeBack = false;
        intervalId = setInterval(() => {
          document.title = showComeBack ? TAB_TITLE_DEFAULT : comeBackTitle;
          showComeBack = !showComeBack;
        }, 1000);
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        document.title = TAB_TITLE_DEFAULT;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalId) clearInterval(intervalId);
      document.title = TAB_TITLE_DEFAULT;
    };
  }, [language]);

  // Urgency timer effect
  useEffect(() => {
    const urgencyInterval = setInterval(() => {
      setUrgencyTimer(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 0, minutes: 45, seconds: 0 }; // Reset for demo
        }
      });
    }, 1000);

    // Update viewers count randomly
    const viewersInterval = setInterval(() => {
      setViewersCount(prev => Math.max(5, prev + Math.floor(Math.random() * 6) - 3));
    }, 15000);

    // Update stock count every 10 minutes with weighted random
    const stockInterval = setInterval(() => {
      setStockCount(getWeightedStockCount());
    }, 600000); // 10 minutes = 600000ms

    // Update recent orders
    const ordersInterval = setInterval(() => {
      const names = ['Ana', 'Petras', 'Marija', 'Jonas', 'Elena', 'Tomas', 'Lina', 'Darius', 'Gintarė', 'Arūnas', 'Rūta', 'Mantas', 'Ieva', 'Tomas', 'Eglė'];
      const lastNames = ['K.', 'L.', 'S.', 'M.', 'R.', 'N.', 'P.', 'B.', 'V.', 'G.', 'J.', 'D.', 'T.', 'A.', 'Z.'];
      const locations = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Utena', 'Tauragė', 'Telšiai', 'Mažeikiai', 'Plungė', 'Radviliškis', 'Kretinga'];
      const products = ['Splash Blaster Pro', 'Mini Splash', '2-pack rinkinys', '4-pack rinkinys', 'Refill Pack'];
      
      const newOrder = {
        name: names[Math.floor(Math.random() * names.length)] + ' ' + 
              lastNames[Math.floor(Math.random() * lastNames.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        time: Math.floor(Math.random() * 45) + 1 + ' min',
        product: products[Math.floor(Math.random() * products.length)]
      };
      
      setRecentOrders(prev => [newOrder, ...prev.slice(0, 2)]);
    }, 20000);

    return () => {
      clearInterval(urgencyInterval);
      clearInterval(viewersInterval);
      clearInterval(stockInterval);
      clearInterval(ordersInterval);
    };
  }, []);

  return (
    <>
    <Suspense fallback={null}>
    <LanguageDetectionPopup
      currentLang={language}
      onChooseLanguage={(lang) => {
        setLanguage(lang);
        if (typeof localStorage !== 'undefined') localStorage.setItem('splashzone-lang', lang);
        if (lang === 'lt') {
          const hadTranslation = document.cookie.includes('googtrans=');
          document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          if (hadTranslation) window.location.reload();
        }
      }}
    />
    </Suspense>
    <Suspense fallback={null}>
    <EmailCapturePopup
      delayMs={12000}
      onSubscribe={async (emailToSubscribe) => {
        const apiBase = (import.meta as any).env?.VITE_API_BASE || '';
        const response = await fetch(`${apiBase}/api/newsletter-subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSubscribe }),
        });
        if (!response.ok && response.status !== 409) throw new Error('Subscribe failed');
      }}
    />
    </Suspense>
    <div
      className="min-h-screen-dvh flex flex-col bg-bg touch-action-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Storefront header: white, logo center, nav row below (reference design) */}
      {/* JSON-LD dynamic for products */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Produktų sąrašas",
        itemListElement: (storeProducts.length ? storeProducts : []).map((p, idx) => {
          const siteOrigin = "https://vasaroskampelis.com";
          const productUrl = `${siteOrigin}/?product=${p.id}`;
          const variantPrices = p.pricesBySize?.length ? p.pricesBySize : [p.price];
          const lowPrice = Math.min(...variantPrices);
          const highPrice = Math.max(...variantPrices);
          const offerBase = {
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            priceValidUntil: "2026-12-31",
            url: productUrl,
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: "2.99", currency: "EUR" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "LT" },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "d" },
                transitTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 7, unitCode: "d" }
              }
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              applicableCountry: "LT",
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
              refundType: "https://schema.org/FullRefund",
              returnPolicyUrl: `${siteOrigin}/grazinimai`
            }
          };
          const offers =
            p.pricesBySize && p.pricesBySize.length > 1
              ? { "@type": "AggregateOffer", lowPrice, highPrice, offerCount: p.pricesBySize.length, ...offerBase }
              : { "@type": "Offer", price: lowPrice, ...offerBase };
          return {
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "Product",
              name: p.name,
              image: p.images?.[0] || p.image,
              description: p.description,
              sku: `KK-${p.id}`,
              brand: { "@type": "Brand", name: "Vasaros Kampelis" },
              url: productUrl,
              offers,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: p.rating,
                reviewCount: p.reviews,
                bestRating: 5,
                worstRating: 1
              }
            }
          };
        })
      }) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Vasaros Kampelis',
            url: 'https://vasaroskampelis.com',
            logo: 'https://vasaroskampelis.com/logo.png',
            sameAs: ['https://www.instagram.com/vasaroskampelis/', 'https://www.tiktok.com/@vasaroskampelis'],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'vasaroskampelis@gmail.com',
              contactType: 'customer service',
              areaServed: 'LT',
              availableLanguage: 'Lithuanian',
            },
          }),
        }}
      />
      <header className="relative storefront-header ios-safe-area shrink-0">
        <div className="storefront-announcement" role="status" aria-live="polite">
          <div className="storefront-header-track">
            <span>{language === 'lt' ? 'Nemokamas pristatymas nuo 80 € visoje Lietuvoje!' : 'Free shipping on orders over €80 across Lithuania!'}</span>
          </div>
        </div>
        {mobileNavOpen && (
          <>
            <div
              role="presentation"
              className="storefront-mobile-nav-backdrop md:hidden"
              aria-hidden="true"
              onClick={() => setMobileNavOpen(false)}
            />
            <div
              id="storefront-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label={language === "lt" ? "Pagrindinis meniu" : "Main menu"}
              className="storefront-mobile-nav-panel md:hidden"
            >
              <div className="storefront-mobile-nav-panel-head">
                <span className="storefront-mobile-nav-title">{language === "lt" ? "Meniu" : "Menu"}</span>
                <button
                  type="button"
                  className="storefront-mobile-nav-close"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label={language === "lt" ? "Uždaryti meniu" : "Close menu"}
                >
                  <X className="h-5 w-5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </button>
              </div>
              <nav className="storefront-mobile-nav-links" aria-label={language === "lt" ? "Pagrindinė navigacija" : "Main navigation"}>
                <NavLink
                  className={({ isActive }) => ['storefront-nav-link storefront-mobile-nav-link', isActive ? 'storefront-nav-link-active' : ''].filter(Boolean).join(' ')}
                  to="/"
                  end
                  onClick={() => setMobileNavOpen(false)}
                >
                  {language === "lt" ? "Pagrindinis" : "Home"}
                </NavLink>
                <NavLink
                  className={({ isActive }) => ['storefront-nav-link storefront-mobile-nav-link', isActive ? 'storefront-nav-link-active' : ''].filter(Boolean).join(' ')}
                  to="/kontaktai"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {language === "lt" ? "Kontaktai" : "Contact"}
                </NavLink>
                <a
                  href="#products"
                  className={[
                    "storefront-nav-link storefront-mobile-nav-link",
                    location.pathname === "/" && location.hash === "#products" ? "storefront-nav-link-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {language === "lt" ? "Šautuvai" : "Products"}
                </a>
              </nav>
              <div className="storefront-mobile-nav-foot">
                <p className="storefront-mobile-nav-foot-ship">
                  {language === "lt" ? "Nemokamas pristatymas nuo 80 €! 🚚" : "Free shipping on orders over €80! 🚚"}
                </p>
                <div className="storefront-mobile-nav-foot-social" aria-label={language === "lt" ? "Socialiniai tinklai" : "Social"}>
                  <a
                    href="https://www.instagram.com/vasaroskampelis/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="storefront-mobile-nav-social-btn"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@vasaroskampelis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="storefront-mobile-nav-social-btn"
                    aria-label="TikTok"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </div>
                <p className="storefront-mobile-nav-foot-help">
                  {language === "lt" ? (
                    <>
                      Turite klausimų?{" "}
                      <a href={`mailto:${BRAND.email}`} className="storefront-mobile-nav-foot-mail">
                        {BRAND.email}
                      </a>
                    </>
                  ) : (
                    <>
                      Questions?{" "}
                      <a href={`mailto:${BRAND.email}`} className="storefront-mobile-nav-foot-mail">
                        {BRAND.email}
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
        <div className="storefront-header-body">
          <div className="storefront-header-track storefront-header-bar">
            <div className="storefront-logo-cell">
              <Link to="/" className="storefront-logo" aria-label={`${t.shopName} — pradžia`}>
                <span className="storefront-logo-mark-wrap">
                  <img
                    src="/logo-32.webp"
                    srcSet="/logo-32.webp 1x, /logo-64.webp 2x"
                    alt=""
                    width={32}
                    height={32}
                    className="storefront-logo-mark"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </span>
                <span className="storefront-logo-wordmark truncate">{t.shopName}</span>
              </Link>
            </div>
            <nav className="storefront-nav-row" aria-label={language === 'lt' ? 'Pagrindinė navigacija' : 'Main navigation'}>
              <NavLink
                className={({ isActive }) => ['storefront-nav-link', isActive ? 'storefront-nav-link-active' : ''].filter(Boolean).join(' ')}
                to="/"
                end
              >
                {language === 'lt' ? 'Pagrindinis' : 'Home'}
              </NavLink>
              <NavLink
                className={({ isActive }) => ['storefront-nav-link', isActive ? 'storefront-nav-link-active' : ''].filter(Boolean).join(' ')}
                to="/kontaktai"
              >
                {language === 'lt' ? 'Kontaktai' : 'Contact'}
              </NavLink>
              <a
                href="#products"
                className={[
                  'storefront-nav-link',
                  location.pathname === '/' && location.hash === '#products' ? 'storefront-nav-link-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {language === 'lt' ? 'Šautuvai' : 'Products'}
              </a>
            </nav>
            <div className="storefront-actions-cell flex items-center gap-0.5 sm:gap-1 md:min-h-[30px]">
              <button
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-1.5 text-primary transition hover:bg-primary/10 hover:text-primaryDark md:p-1"
                type="button"
                onClick={() => setWishlistOpen((s) => !s)}
                title={t.wishlist}
              >
                <Heart className="w-5 h-5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-cta text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-1.5 text-primary transition hover:bg-primary/10 hover:text-primaryDark md:p-1"
                type="button"
                onClick={() => setCartOpen(true)}
                title={t.cart}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-cta text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                className="storefront-mobile-nav-trigger relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-1.5 text-primary transition hover:bg-primary/10 hover:text-primaryDark md:hidden"
                type="button"
                aria-expanded={mobileNavOpen}
                aria-controls="storefront-mobile-nav"
                aria-haspopup="dialog"
                onClick={() => setMobileNavOpen((o) => !o)}
                title={language === "lt" ? "Meniu" : "Menu"}
              >
                {mobileNavOpen ? (
                  <X className="h-6 w-6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
                ) : (
                  <Menu className="h-6 w-6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scroll-snap slideshow container – full viewport sections with entrance animations */}
      <div ref={scrollContainerRef} className="snap-scroll-container">
        {/* Section 1: Hero – full-screen image slideshow with overlay */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="snap-slide hero-section"
        >
          <div className="slide-content w-full h-full">
            <HeroSlideshow language={language} />
          </div>
        </section>

        <section
          className="sr-only"
          aria-label={language === "lt" ? "Vasaros Kampelis — apie vandens žaidimus" : "Vasaros Kampelis — about water play"}
        >
          <h2>
            {language === "lt"
              ? "Vandens šautuvai, vandens pistoletai ir vasaros žaidimai lauke"
              : "Water blasters, pistols and outdoor summer play"}
          </h2>
          {language === "lt" ? (
            <div>
              <p>
                Ieškote kokybiško <strong>vandens šautuvo</strong>, kuris tikrai įtrauktų visą šeimą? Mūsų elektriniai
                modeliai šaudo iki dešimties metrų, turi didelę rezervuarą ir tinka tikriems vandens mūšiams kieme ar
                sode – be aštrių dalių, tik smagus spaudimas ir švari vandens srovė.
              </p>
              <p>
                <strong>Vandens pistoletas vaikams</strong> ir suaugusiems pas mus yra parinktas taip, kad mažiesiems
                būtų paprasta laikyti ir saugu žaisti, o tėvams – ramu stebėti žaidimą lauke. Tinkama dovana
                gimtadieniui ar papildymas prie baseino, kai norisi daugiau judesio ir mažiau ekranų.
              </p>
              <p>
                Geriausias <strong>blasteris vasarai</strong> – tai tas, kuris atlaiko intensyvias sesijas, greitai
                pasikrauna vandeniu ir išlaiko stabilų spaudimą nuo pirmo iki paskutinio šūvio. Vasaros Kampelis padeda
                išsirinkti patikimus variantus linksmybėms kieme, terasoje ar parkelyje penktadienio piknikui.
              </p>
              <p>
                <strong>Vandens žaidimai lauke</strong> su draugais ir šeima – paprasčiausias būdas pridėti judesio,
                juoko ir vėsaus atvėsimo karštą dieną. Užsisakykite internetu visoje Lietuvoje – pristatome į
                didmiesčius ir mažesnius miestelius, o nuo 80 € pristatymas nemokamas.
              </p>
            </div>
          ) : (
            <div>
              <p>
                Looking for a quality <strong>water blaster</strong> that actually gets the whole family involved? Our
                electric models shoot up to about ten metres, hold plenty of water and are built for real backyard
                battles – no sharp parts, just fun streams and easy controls.
              </p>
              <p>
                A <strong>water pistol for kids</strong> (and adults) should feel safe in small hands. We focus on
                sturdy, rounded designs so summer play stays light-hearted whether you are by a paddling pool or
                running through the garden.
              </p>
              <p>
                The right <strong>summer blaster</strong> keeps pressure steady, refills quickly and survives long
                afternoons outside. Vasaros Kampelis curates options you can rely on for terraces, yards and sunny
                weekend picnics.
              </p>
              <p>
                <strong>Outdoor water games</strong> are the easiest way to add movement and laughter on hot days.
                Order online with delivery across Lithuania – free shipping from 80 €.
              </p>
            </div>
          )}
        </section>

        {/* Section 2: Pillow-style Why – two columns: text left, comparison table right */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="snap-slide snap-auto pillow-why-section"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
        >
          <div className="slide-content w-full">
            <div className="max-w-6xl lg:max-w-7xl xl:max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="pillow-why-grid">
                <div>
                  <h2 className="pillow-why-headline">
                    {language === 'lt' ? 'Kodėl Vasaros Kampelis?' : 'Why Vasaros Kampelis?'}
                  </h2>
                  <div className="pillow-why-body">
                    <p>
                      {language === 'lt'
                        ? 'Vasaros Kampelis - vieta, kur vasara tampa tikru iššūkiu! 💦🔥'
                        : 'Vasaros Kampelis – where summer becomes a real challenge! 💦🔥'}
                    </p>
                    <p>
                      {language === 'lt'
                        ? 'Vandens mūšiai kieme, adrenalinas iki sutemų ir akimirkos, kurias prisiminsite dar ilgai!'
                        : 'Water battles in the yard, adrenaline until dusk and moments you\'ll remember for a long time!'}
                    </p>
                    <p>
                      {language === 'lt'
                        ? 'Mūsų modeliai skirti ne paprastam apsitaškymui - jie sukurti tikram veiksmui, stipriam spaudimui ir rimtai konkurencijai tarp draugų!'
                        : 'Our models aren\'t for casual splashing – they\'re built for real action, strong pressure and serious competition among friends!'}
                    </p>
                    <p>
                      {language === 'lt'
                        ? <>Mažiau ekranų! 🖥️<br />Daugiau judesio! 🏃‍♂️<br />Daugiau veiksmo! 💪</>
                        : <>Less screen time! 🖥️<br />More movement! 🏃‍♂️<br />More action! 💪</>}
                    </p>
                  </div>
                </div>
                <Suspense fallback={null}><ComparisonTable embedded otherLabel={language === 'lt' ? 'Kiti' : 'Others'} /></Suspense>
              </div>
            </div>
          </div>
        </section>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-20 right-4 bg-cta text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}

        {/* Section 4: Products (recently viewed + recommendations + main grid) */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="snap-slide bg-bg"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}
        >
          <div className="slide-content w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="bg-surface py-4 rounded-xl border border-border mb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-semibold text-text mb-3">{t.recentlyViewed}</h3>
            <div className="flex space-x-3">
                  {recentlyViewed.map(productId => {
                const product = products.find(p => p.id === productId);
                return product ? (
                  <div key={productId} className="w-16 h-16 rounded-lg overflow-hidden">
                    <OptimizedImage
                      src={product.image}
                      srcSet={productSrcSet(product.image)}
                      alt={`${product.name} - Neseniai žiūrėtas produktas`}
                      className="w-full h-full object-cover cursor-pointer"
                      loading="lazy"
                      decoding="async"
                      width={64}
                      height={64}
                      sizes="64px"
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedImageIndex(0);
                        setSelectedSizesByGroup(product.sizeGroups ? product.sizeGroups.map(() => 0) : []);
                        setProductModalOpen(true);
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tikros akimirkos – full-width showcase */}
      <div className="promo-shorts-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="promo-shorts-heading">Tikros akimirkos iš vasaros mūšių</h2>
          <p className="promo-shorts-sub">Pažiūrėk, kaip atrodo tikras veiksmas su mūsų ginklais! 👀</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 mt-8">
            <div className="promo-shorts-card">
              <LazyVideo
                src="/Promo111.mp4"
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls
                aria-label="Promo 111"
                priority
              />
            </div>
            <div className="promo-shorts-card">
              <LazyVideo
                src="/Promo2.mp4"
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls
                aria-label="Promo 2"
              />
            </div>
            <div className="promo-shorts-card">
              <LazyVideo
                src="/Promo3.mp4"
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls
                aria-label="Promo 3"
              />
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <WhyChooseUs language={language} />
      </Suspense>

      {/* Products – one big section with inline variant selection */}
      <main id="products" className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 flex-1">
        <h2 className="revo-section-title text-center mb-1.5">{t.products}</h2>
        <p className="revo-section-sub text-center mb-5 md:mb-6 pl-6 pr-1">Tegul prasideda tikras vasaros mūšis! 🚀</p>
        {productsSorted.length === 0 ? (
          <div className="text-center text-muted py-12">
            Šiuo metu nėra prekių. Pridėkite naujų įrašų – aš paruošiau vietą nuotraukoms ir aprašymams.
          </div>
        ) : (() => {
          const product = productsSorted[0];
          const variantPrices = product.pricesBySize ?? [product.price];
          const variantOriginals = product.originalPricesBySize ?? [product.originalPrice];
          const variantImages = product.imagesBySize ?? [product.images ?? [product.image]];
          const sizeGroups = product.sizeGroups ?? [];
          const typeIdx = sectionSizesByGroup[0] ?? 0;
          const colorIdx = sectionSizesByGroup[1] ?? 0;
          const combinedIndex = sizeGroups.length >= 2
            ? (typeIdx * (sizeGroups[1]?.sizes?.length ?? 1) + colorIdx)
            : typeIdx;
          const currentPrice = Number(variantPrices[combinedIndex] ?? product.price);
          const currentOriginal = Number(variantOriginals[combinedIndex] ?? product.originalPrice);
          const currentVariantImages = variantImages[combinedIndex] ?? variantImages[0] ?? [];
          const currentImage = resolveImagePath(currentVariantImages[sectionImageIndex] ?? currentVariantImages[0] ?? product.image);
          const typeName = sizeGroups[0]?.sizes?.[typeIdx]?.name ?? '';
          const colorName = sizeGroups[1]?.sizes?.[colorIdx]?.name ?? '';
          const variantName = [typeName, colorName].filter(Boolean).join(' · ');
          const featPreviewCount = 2;
          const hasHiddenFeatures = product.features.length > featPreviewCount;
          const featuresVisible = sectionFeaturesExpanded
            ? product.features
            : product.features.slice(0, featPreviewCount);
          const discountPct = currentOriginal > currentPrice
            ? Math.round((1 - currentPrice / currentOriginal) * 100)
            : 0;
          const savingsEur =
            currentOriginal > currentPrice ? Math.max(0, currentOriginal - currentPrice) : 0;
          const savingsFormattedLt =
            savingsEur > 0 ? `${savingsEur.toFixed(2).replace('.', ',')} €` : '';
          const stockLeft = computePdpStockLeft(combinedIndex);
          const stockPct = computePdpStockPct(stockLeft);
          const isLowStock = stockLeft <= 10;
          return (
            <div className="product-section-card w-full max-w-full overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.72fr)] gap-0 w-full items-stretch">
                <div className="product-section-image relative w-full min-w-0 max-w-full flex flex-col justify-center p-3 sm:p-4 lg:p-5 xl:p-6 overflow-hidden">
                  <div className="w-full min-w-0 flex flex-col md:flex-row flex-1 gap-3 md:gap-4 items-stretch md:items-start max-w-[min(100%,1040px)] mx-auto">
                    {currentVariantImages.length > 1 && (
                      <nav
                        className="order-2 md:order-1 flex flex-row md:flex-col gap-2 md:gap-2.5 shrink-0 justify-center md:justify-start overflow-x-auto md:overflow-y-auto md:overflow-x-visible w-full md:w-auto md:max-h-[min(62vh,560px)] py-1 md:py-0 md:pr-1 lg:sticky lg:top-6"
                        aria-label="Produkto nuotraukos"
                      >
                        {currentVariantImages.map((url: string, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSectionImageIndex(i)}
                            className={`product-gallery-thumb relative w-16 h-16 sm:w-[72px] sm:h-[72px] flex-shrink-0 overflow-hidden bg-surface shadow-sm touch-manipulation active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/45 focus-visible:ring-offset-2 ${
                              sectionImageIndex === i ? 'product-gallery-thumb-active' : ''
                            }`}
                            aria-label={
                              variantName
                                ? `${product.name}, ${variantName}: nuotrauka ${i + 1} iš ${currentVariantImages.length}`
                                : `${product.name}: nuotrauka ${i + 1} iš ${currentVariantImages.length}`
                            }
                            aria-current={sectionImageIndex === i ? 'true' : undefined}
                          >
                            <OptimizedImage
                              src={resolveImagePath(url)}
                              srcSet={productSrcSet(url)}
                              alt=""
                              className="w-full h-full object-cover"
                              width={72}
                              height={72}
                              sizes="72px"
                            />
                          </button>
                        ))}
                      </nav>
                    )}
                    <div className="order-1 md:order-2 relative flex-1 min-w-0 w-full flex flex-col justify-center">
                      {product.isNew && (
                        <span className="product-gallery-badge absolute top-3 right-3 sm:top-4 sm:right-4 z-20 inline-flex items-center gap-1.5 text-white text-[0.7rem] sm:text-xs font-extrabold uppercase tracking-[0.08em] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)]" aria-hidden="true"></span>
                          {t.newBadge}
                        </span>
                      )}
                      <div className="product-gallery-main-frame overflow-hidden group/gallery flex-1 flex flex-col min-h-0">
                        <div className="relative flex-1 flex items-center justify-center aspect-square w-full max-h-[min(72vw,380px)] sm:max-h-[min(65vw,440px)] lg:max-h-[min(54vh,500px)] mx-auto min-h-0 p-4 sm:p-5 lg:p-6 box-border cursor-[zoom-in]">
                          {discountPct > 0 && (
                            <span
                              className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none inline-flex items-center rounded-full bg-cta px-3 py-1.5 text-sm sm:text-base font-black text-white shadow-[0_6px_20px_rgba(245,99,26,0.45)] ring-2 ring-white/90 tabular-nums"
                              aria-hidden="true"
                            >
                              −{discountPct}%
                            </span>
                          )}
                          <span className="product-gallery-floor" aria-hidden="true"></span>
                          <OptimizedImage
                            src={currentImage}
                            srcSet={productSrcSet(currentImage)}
                            alt={`${product.name} – ${variantName}`}
                            className="product-gallery-zoom relative max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 ease-out motion-safe:md:group-hover/gallery:scale-[1.06]"
                            loading="eager"
                            decoding="async"
                            width={600}
                            height={600}
                            sizes="(max-width: 768px) min(72vw, 380px), (max-width: 1024px) 45vw, 500px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-section-commerce flex flex-col justify-start lg:justify-center min-w-0 p-4 sm:p-5 lg:py-6 lg:px-6 xl:px-8 lg:max-w-[28rem] xl:max-w-[30rem] lg:border-l lg:border-border/60">
                  <div className="flex items-center gap-2 mb-2" aria-label={`Įvertinimas ${product.rating} iš 5`}>
                    {renderStars(product.rating, 'w-4 h-4 sm:w-[18px] sm:h-[18px]')}
                    <span className="text-sm font-medium text-muted">{product.rating} <span className="text-muted/70">({product.reviews})</span></span>
                  </div>
                  <h3 className="revo-product-card-title text-xl sm:text-2xl xl:text-[1.65rem] mb-1.5 leading-tight tracking-tight">{product.name}</h3>
                  <p className="text-muted text-sm leading-snug font-medium mb-3">{product.description}</p>
                  <div className="mb-3 space-y-1">
                    {featuresVisible.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-text/90 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {hasHiddenFeatures && (
                      <button
                        type="button"
                        onClick={() => setSectionFeaturesExpanded(!sectionFeaturesExpanded)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primaryDark mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                        aria-expanded={sectionFeaturesExpanded}
                      >
                        {sectionFeaturesExpanded ? t.pdpFeaturesLess : t.pdpFeaturesMore}
                        <ChevronDown className={`w-4 h-4 transition-transform ${sectionFeaturesExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {sizeGroups.map((group: { label: string; sizes: { name: string; value: string }[] }, gIndex: number) => (
                    <div key={gIndex} className="mb-3">
                      <p className="text-[0.72rem] font-bold uppercase tracking-wider text-muted mb-1.5">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.sizes?.map((v: { name: string; value: string }, idx: number) => (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() => {
                              setSectionSizesByGroup(prev => {
                                const next = [...prev];
                                next[gIndex] = idx;
                                return next;
                              });
                              setSectionImageIndex(0);
                            }}
                            className={`product-section-variant px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-text sm:px-5 sm:py-3 sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/40 focus-visible:ring-offset-2 ${
                              (sectionSizesByGroup[gIndex] ?? 0) === idx ? 'active' : 'bg-bg'
                            }`}
                            aria-pressed={(sectionSizesByGroup[gIndex] ?? 0) === idx}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="mb-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="text-3xl xl:text-[2rem] font-bold text-cta tracking-tight tabular-nums">
                        €{currentPrice.toFixed(2)}
                      </span>
                      {currentOriginal > currentPrice && (
                        <span className="text-base text-muted line-through tabular-nums">
                          €{currentOriginal.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {savingsEur > 0 && (
                      <p className="mt-1 text-sm font-bold text-cta tabular-nums">
                        Sutaupote {savingsFormattedLt}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold mb-1.5">
                      <span className={isLowStock ? 'text-red-600' : 'text-emerald-600'}>
                        {isLowStock ? '⏳ Skubėk, baigiasi!' : '✓ Sandėlyje'}
                      </span>
                      <span
                        className={
                          isLowStock
                            ? 'text-red-700 shrink-0 tabular-nums'
                            : 'text-text/85 shrink-0 tabular-nums'
                        }
                      >
                        Liko {stockLeft} vnt
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/70 overflow-hidden" role="progressbar" aria-valuenow={stockLeft} aria-valuemin={0} aria-valuemax={PDP_STOCK_CAP} aria-label="Likutis sandėlyje">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${isLowStock ? 'bg-gradient-to-r from-red-500 to-cta' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-stretch gap-2 mb-2">
                    <div className="inline-flex items-stretch rounded-xl border-2 border-border overflow-hidden bg-surface">
                      <button
                        type="button"
                        onClick={() => setSectionQuantity(Math.max(1, sectionQuantity - 1))}
                        className="w-11 sm:w-12 flex items-center justify-center text-text font-bold text-lg hover:bg-primary/10 disabled:opacity-40 transition-colors"
                        aria-label="Sumažinti kiekį"
                        disabled={sectionQuantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-10 sm:w-12 flex items-center justify-center font-bold text-base text-text border-x border-border tabular-nums" aria-live="polite">{sectionQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setSectionQuantity(sectionQuantity + 1)}
                        className="w-11 sm:w-12 flex items-center justify-center text-text font-bold text-lg hover:bg-primary/10 transition-colors"
                        aria-label="Padidinti kiekį"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: currentPrice,
                          image: currentImage,
                          quantity: sectionQuantity,
                          selectedColor: colorName,
                          selectedSize: typeName,
                          sizeLabel: sizeGroups[0]?.label ?? 'Tipas'
                        });
                        setSectionAddSuccess(true);
                        setTimeout(() => setSectionAddSuccess(false), 3000);
                      }}
                      className="product-section-cta group flex-1 min-w-[min(100%,180px)] inline-flex items-center justify-center gap-2 py-3 px-4 sm:py-3.5 sm:px-5 rounded-xl text-white font-bold text-sm sm:text-base border-0"
                    >
                      <span>{t.addToCart}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="min-h-[1.25rem] mb-2" aria-live="polite">
                    {sectionAddSuccess && (
                      <p className="text-emerald-600 font-semibold text-sm flex items-center gap-1.5">
                        <Check className="w-4 h-4" aria-hidden="true" />
                        {t.addedToCart}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60 text-[0.7rem] sm:text-xs text-muted">
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Package className="w-4 h-4 text-primary" aria-hidden="true" />
                      Greitas pristatymas
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <span className="text-base leading-none" aria-hidden="true">⭐</span>
                      TOP Pasirinkimas
                    </span>
                    <span className="flex flex-col items-center gap-1 text-center">
                      <Headphones className="w-4 h-4 text-primary" aria-hidden="true" />
                      24/7 pagalba
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </main>
          </div>
        </section>

        {/* Section 5: Reviews */}
        <section ref={(el) => { sectionRefs.current[3] = el; }} className="snap-slide snap-auto bg-bg" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
          <div className="slide-content w-full">
      <Suspense fallback={null}>
        <ReviewsSection />
      </Suspense>
          </div>
        </section>

        {/* Section 6: FAQ + Newsletter + Footer – no bottom padding so footer is last */}
        <section ref={(el) => { sectionRefs.current[4] = el; }} className="snap-slide snap-auto bg-bg" style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
          <div className="slide-content w-full">
      <Suspense fallback={null}>
        <FAQAccordion />
      </Suspense>

      {/* Newsletter */}
      <section className="relative bg-bg pt-0 pb-6 md:pb-8 px-4 sm:px-6 lg:px-8 text-center overflow-hidden cv-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl border border-white/20 text-white p-6 md:p-8 shadow-[0_20px_50px_rgba(14,165,233,0.25)]"
            style={{
              backgroundImage:
                'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primaryDark) 45%, #0369a1 100%), radial-gradient(ellipse 80% 60% at 100% 0%, rgba(255,255,255,0.12) 0%, transparent 55%)',
            }}
          >
            <Mail className="mx-auto mb-2 w-9 h-9 opacity-95" />
            <h3 className="text-2xl font-bold mb-1.5">
              Sužinokite pirmi apie naujienas!
            </h3>
            <p className="text-sm mb-3 text-white/90">
              Užsiprenumeruokite naujienlaiškį - informuosime apie akcijas ir naujausius vasaros pasiūlymus.
            </p>
            <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!validateEmail(email)) {
                setNewsletterMsg({ type: 'error', text: 'Prašome įvesti galiojantį el. pašto adresą.' });
                return;
              }

              // Basic client-side rate limiting to reduce spam
              try {
                const now = Date.now();
                const eightHoursMs = 8 * 60 * 60 * 1000;
                const dayWindowMs = 24 * 60 * 60 * 1000;
                const attempts: number[] = JSON.parse(localStorage.getItem('nl_attempts') || '[]').filter((t: number) => now - t < eightHoursMs);
                localStorage.setItem('nl_attempts', JSON.stringify(attempts));
                if (attempts.length >= 100) {
                  setNewsletterMsg({ type: 'error', text: 'Per daug bandymų. Limitas: 100 per 8 valandas.' });
                  return;
                }
                // Prevent duplicate email permanently (and keep 24h log as secondary)
                const emailLog: Record<string, number> = JSON.parse(localStorage.getItem('nl_emails') || '{}');
                const permanentEmails: string[] = JSON.parse(localStorage.getItem('nl_emails_perm') || '[]');
                if (permanentEmails.includes(email) || (emailLog[email] && now - emailLog[email] < dayWindowMs)) {
                  setNewsletterMsg({ type: 'error', text: 'Šis el. paštas jau užregistruotas.' });
                  return;
                }
                setIsSubmittingNewsletter(true);
                
                // Proceed to submit
              try {
                const apiBase = ((import.meta as any).env?.VITE_API_BASE as string) || '';
                const response = await fetch(`${apiBase}/api/newsletter-subscribe`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({ email })
                });
                if (response.status === 409) {
                  setNewsletterMsg({ type: 'error', text: 'Šis el. paštas jau užregistruotas.' });
                  setIsSubmittingNewsletter(false);
                  return;
                }
                // Treat any other server response as success (email accepted)
                if (response.ok || !response.ok) {
                  setNewsletterMsg({ type: 'success', text: 'Ačiū! Jūs sėkmingai užsiprenumeravote naujienlaiškį.' });
                setEmail('');
                  // store attempt and email
                  const newAttempts = [...attempts, now];
                  localStorage.setItem('nl_attempts', JSON.stringify(newAttempts));
                  emailLog[email] = now;
                  localStorage.setItem('nl_emails', JSON.stringify(emailLog));
                  if (!permanentEmails.includes(email)) {
                    permanentEmails.push(email);
                    localStorage.setItem('nl_emails_perm', JSON.stringify(permanentEmails));
                  }
                }
              } catch (err) {
                setNewsletterMsg({ type: 'error', text: 'Tinklo klaida. Bandykite dar kartą.' });
              }
              } finally {
                setIsSubmittingNewsletter(false);
              }
              setTimeout(() => setNewsletterMsg(null), 4000);
            }}
            className="flex flex-col sm:flex-row gap-3 justify-center mx-auto max-w-2xl"
          >
              <input
                placeholder="Įveskite savo el. paštą"
                className="w-full sm:flex-1 px-4 py-3 rounded-md text-black shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {/* Honeypot for additional spam protection */}
              <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
              <button disabled={isSubmittingNewsletter} className={`bg-cta text-white font-semibold px-6 py-3 rounded-md hover:bg-ctaHover min-h-[48px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${isSubmittingNewsletter ? 'opacity-60 cursor-not-allowed' : ''}`}>
                Prenumeruoti
              </button>
            </form>
            <p className="mt-3 text-sm text-white/80 text-center max-w-xl mx-auto">
              Įvesdamas el. paštą sutinku gauti „Vasaros Kampelio“ pasiūlymus ir naujienas.
            </p>
            {newsletterMsg && (
              <div className={`mt-4 max-w-xl mx-auto rounded-lg border px-4 py-3 text-sm font-semibold shadow ${
                newsletterMsg.type === 'success'
                  ? 'bg-promoBg border-success text-text'
                  : 'bg-promoBg border-promoBorder text-text'
              }`}>
                <div className="flex items-center gap-2 justify-center">
                  {newsletterMsg.type === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>{newsletterMsg.text}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer – inside section 9; footer color */}
      <footer className="relative overflow-hidden border-t border-border bg-bg text-text">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-8 lg:px-8">
          <div className="flex w-full flex-col items-center gap-6 text-center md:gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-5 lg:text-left xl:gap-8">
            <div className="flex w-full shrink-0 flex-col items-center gap-2.5 md:gap-4 lg:mx-auto lg:max-w-[17rem] lg:items-center lg:gap-6 lg:text-center">
              <Link
                to="/"
                className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                aria-label={`${t.shopName} — pradžia`}
              >
                <img
                  src="/logo-220.webp"
                  srcSet="/logo-220.webp 1x, /logo-440.webp 2x"
                  alt=""
                  width={176}
                  height={56}
                  className="mx-auto h-14 w-auto max-w-[220px] object-contain object-center opacity-95 md:h-[4rem]"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <p className="mx-auto max-w-[18rem] text-[15px] font-normal leading-snug text-text/[0.72] lg:max-w-[17rem]">
                {language === 'lt'
                  ? 'Vandens šautuvai ir lauko žaidimai visai šeimai!'
                  : 'Water blasters & outdoor splash fun for families.'}
              </p>
            </div>
            <div className="w-full shrink-0 text-center lg:w-auto lg:min-w-0 lg:flex-1 lg:basis-0 lg:text-left">
              <h4 className="mb-2 text-2xl font-extrabold tracking-tight text-text md:mb-4">Nuorodos</h4>
              <ul className="space-y-2 text-base font-medium leading-snug md:space-y-1.5 md:text-sm">
                <li>
                  <Link to="/apie-mus" className="cursor-pointer text-text hover:text-primary">
                    Apie mus
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="cursor-pointer text-text hover:text-primary">
                    Blogas
                  </Link>
                </li>
                <li>
                  <Link to="/kontaktai" className="cursor-pointer text-text hover:text-primary">
                    Kontaktai
                  </Link>
                </li>
              </ul>
            </div>
              <div className="w-full shrink-0 text-center lg:w-auto lg:min-w-0 lg:flex-1 lg:basis-0 lg:text-left">
                <h4 className="mb-2 text-2xl font-extrabold tracking-tight text-text md:mb-4">Teisinė informacija</h4>
                <ul className="space-y-2 text-base font-medium leading-snug md:space-y-1.5 md:text-sm">
                  <li>
                    <Link to="/pristatymo-info" className="cursor-pointer text-text hover:text-primary">
                      Pristatymo Info
                    </Link>
                  </li>
                  <li>
                    <Link to="/grazinimai" className="cursor-pointer text-text hover:text-primary">
                      Grąžinimai
                    </Link>
                  </li>
                  <li>
                    <Link to="/privatumo-politika" className="cursor-pointer text-text hover:text-primary">
                      Privatumo Politika
                    </Link>
                  </li>
                  <li>
                    <Link to="/slapuku-politika" className="cursor-pointer text-text hover:text-primary">
                      Slapukų politika
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="w-full shrink-0 text-center lg:w-auto lg:min-w-0 lg:flex-1 lg:basis-0 lg:text-left">
                <h4 className="mb-2 text-2xl font-extrabold tracking-tight text-text md:mb-4">Kontaktai</h4>
                <ul className="space-y-2 text-base font-medium leading-snug text-text md:space-y-1.5 md:text-sm">
                  <li>
                    <a
                      href="mailto:vasaroskampelis@gmail.com"
                      className="flex min-h-8 flex-wrap items-center justify-center gap-3 py-0.5 font-medium text-text transition-colors hover:text-primary lg:justify-start"
                    >
                      <span className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:block" aria-hidden>
                        <Mail className="size-[18px]" strokeWidth={1.375} strokeLinecap="round" strokeLinejoin="round" />
                      </span>
                      <span className="leading-tight">vasaroskampelis@gmail.com</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/vasaroskampelis/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-8 flex-wrap items-center justify-center gap-3 py-0.5 font-medium text-text transition-colors hover:text-primary lg:justify-start"
                    >
                      <span className="inline-flex size-[18px] shrink-0 items-center justify-center text-current [&>svg]:block" aria-hidden>
                        <Instagram className="size-[18px] stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round" />
                      </span>
                      <span className="leading-tight">vasaroskampelis</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.tiktok.com/@vasaroskampelis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-8 flex-wrap items-center justify-center gap-3 py-0.5 font-medium text-text transition-colors hover:text-primary lg:justify-start"
                    >
                      <span
                        aria-hidden
                        className="inline-flex size-[18px] shrink-0 bg-current [-webkit-mask-image:url('https://cdn.simpleicons.org/tiktok/ffffff')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-image:url('https://cdn.simpleicons.org/tiktok/ffffff')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
                      />
                      <span className="leading-tight">vasaroskampelis</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
        </div>
        <div className="mx-auto w-full max-w-6xl border-t border-border px-4 pb-4 pt-3 sm:px-6 md:pb-6 md:pt-5 lg:px-8">
          <div className="flex w-full flex-col items-center gap-2 text-center md:gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="sr-only">
                {language === 'lt'
                  ? 'Saugūs mokėjimai: Visa ir Mastercard.'
                  : 'Secure payments via Visa and Mastercard.'}
              </span>
              <div
                className="flex h-[2.375rem] min-w-[3.625rem] items-center justify-center rounded-[10px] border border-white/90 bg-white/75 px-2.5 shadow-[0_1px_4px_rgba(15,23,42,0.07)] backdrop-blur-[8px]"
                aria-hidden
              >
                <img src="/Mastercard-logo.png" alt="" width={50} height={16} className="max-h-[1rem] w-auto max-w-[3.125rem] object-contain opacity-95" loading="lazy" decoding="async" />
              </div>
              <div
                className="flex h-[2.375rem] min-w-[3.625rem] items-center justify-center rounded-[10px] border border-white/90 bg-white/75 px-2.5 shadow-[0_1px_4px_rgba(15,23,42,0.07)] backdrop-blur-[8px]"
                aria-hidden
              >
                <span className="font-[system-ui,sans-serif] text-[11px] font-extrabold tracking-[0.12em] text-[#1A1F71] sm:text-[12px]">
                  VISA
                </span>
              </div>
            </div>
            <p className="mx-auto max-w-xl text-xs leading-snug text-muted">
              © 2026 Vasaros Kampelis. Visos teisės saugomos.
            </p>
            <div className="flex w-full max-w-xl flex-row flex-wrap items-center justify-center gap-2 leading-snug text-muted">
              <Lock className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              <span className="text-xs font-semibold">SSL Secure Checkout | 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </footer>
          </div>
        </section>
      </div>

      <Suspense fallback={null}><StickyMobileCTA totalItems={totalItems} onCartClick={() => setCartOpen(true)} /></Suspense>

      {/* Shopping Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div
            className={`fixed right-0 top-0 w-full max-w-md bg-white shadow-xl overflow-y-auto ${totalItems === 0 ? 'h-auto max-h-full' : 'h-full'}`}
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', color: '#1a1a1a' }}
          >
            <div style={{ padding: 18 }}>
              {/* Header */}
              {(() => {
                const n = totalItems;
                const mod10 = n % 10;
                const mod100 = n % 100;
                const itemsWord = (mod10 === 1 && mod100 !== 11)
                  ? 'prekė'
                  : (mod10 >= 2 && mod10 <= 9 && (mod100 < 10 || mod100 >= 20))
                    ? 'prekės'
                    : 'prekių';
                return (
                  <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>Krepšelis</h2>
                      {n > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#F5631A',
                            backgroundColor: '#fff1e8',
                            padding: '3px 9px',
                            borderRadius: 999,
                            lineHeight: 1,
                          }}
                        >
                          {n} {itemsWord}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="hover:bg-gray-100"
                      aria-label="Užverti krepšelį"
                      style={{
                        width: 32,
                        height: 32,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        backgroundColor: '#ffffff',
                        color: '#6b7280',
                      }}
                    >
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                );
              })()}

              {/* Free Shipping Progress – flat on white */}
              {totalItems > 0 && (() => {
                const remaining = Math.max(0, 80 - totalPrice);
                const percent = isFreeShipping ? 100 : Math.min(100, (totalPrice / 80) * 100);
                return (
                  <div
                    style={{
                      marginBottom: 20,
                      padding: '14px 14px 16px',
                      borderRadius: 14,
                      backgroundColor: '#fafafa',
                      border: '1px solid rgba(226, 232, 240, 0.95)',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(15, 23, 42, 0.07)',
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: isFreeShipping ? '#16a34a' : '#1a1a1a' }}>
                      {isFreeShipping
                        ? '🎉 Gavote nemokamą pristatymą!'
                        : <>Dar <span style={{ fontWeight: 800 }}>€{remaining.toFixed(2)}</span> iki nemokamo pristatymo 🎉</>}
                    </p>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: '#e5e7eb',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          borderRadius: 3,
                          background: isFreeShipping ? '#16a34a' : 'linear-gradient(90deg, #f5a623, #16a34a)',
                          transition: 'width 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 240ms ease',
                          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.25) inset',
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Cart Reservation Timer – quiet inline note */}
              {totalItems > 0 && (() => {
                const totalSec = (urgencyTimer.hours * 3600) + (urgencyTimer.minutes * 60) + urgencyTimer.seconds;
                const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
                const ss = String(totalSec % 60).padStart(2, '0');
                const urgent = totalSec < 300;
                return (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Jūsų krepšelis rezervuotas</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: urgent ? '#ef4444' : '#6b7280' }}>
                      {mm}:{ss}
                    </span>
                  </div>
                );
              })()}

              {/* Cart Items */}
              {totalItems === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">{t.emptyCart}</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm text-white"
                    style={{ backgroundColor: '#F5631A' }}
                  >
                    {t.continueShopping}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 4 }}>
                  {cartItems.filter((it: any) => it.productId !== MYSTERY_GIFT.productId).map((item: any) => {
                    const variantBits: string[] = [];
                    if (item.selectedColor) variantBits.push(item.selectedColor);
                    if (item.selectedSize) variantBits.push(item.selectedSize);
                    const lineTotal = Number(item.price) * Number(item.quantity || 1);
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '14px 14px 14px 12px',
                          borderRadius: 14,
                          backgroundColor: '#fafafa',
                          border: '1px solid #E0E0E0',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(15, 23, 42, 0.07)',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={`${item.name} - Krepšelyje`}
                          loading="lazy"
                          decoding="async"
                          width="72"
                          height="72"
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: 'cover',
                            borderRadius: 10,
                            backgroundColor: '#ffffff',
                            flexShrink: 0,
                            border: '1px solid #E0E0E0',
                            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.06)',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.25, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </h3>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                              €{lineTotal.toFixed(2)}
                            </span>
                          </div>
                          {variantBits.length > 0 && (
                            <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>
                              {variantBits.join(' · ')}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: 30,
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                overflow: 'hidden',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Sumažinti kiekį"
                                style={{ width: 30, height: 30, fontSize: 14, color: '#1a1a1a', backgroundColor: 'transparent' }}
                              >
                                −
                              </button>
                              <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Padidinti kiekį"
                                style={{ width: 30, height: 30, fontSize: 14, color: '#1a1a1a', backgroundColor: 'transparent' }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mystery Gift Upsell */}
              {totalItems > 0 && (
                <Suspense fallback={null}>
                  <MysteryGiftUpsell
                    isInCart={mysteryInCart}
                    onAdd={() => addItem({
                      productId: MYSTERY_GIFT.productId,
                      name: MYSTERY_GIFT.name,
                      price: MYSTERY_GIFT.price,
                      image: MYSTERY_GIFT.image,
                      quantity: 1,
                      selectedColor: MYSTERY_GIFT.selectedColor,
                      selectedSize: MYSTERY_GIFT.selectedSize,
                    })}
                    onRemove={() => { if (mysteryGiftCartItem) removeItem(mysteryGiftCartItem.id); }}
                  />
                </Suspense>
              )}

              {/* Checkout Footer */}
              {totalItems > 0 && (() => {
                const orderTotalEur = orderCents / 100;
                return (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #e5e7eb' }}>
                    <style>{`
                      .checkout-cta { transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, background-color 200ms ease; }
                      .checkout-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 26px rgba(245, 99, 26, 0.38); background-color: #e35614; }
                    `}</style>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Viso mokėti</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>
                        €{orderTotalEur.toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const w: any = (typeof window !== 'undefined') ? window : null;
                          if (w && typeof w.fbq === 'function') {
                            w.fbq('track', 'InitiateCheckout', {
                              value: Number(orderTotalEur.toFixed(2)),
                              currency: 'EUR',
                              num_items: totalItems,
                            });
                          }
                        } catch {}
                        setCheckoutOpen(true);
                      }}
                      className="checkout-cta"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: 11,
                        backgroundColor: '#F5631A',
                        color: '#ffffff',
                        boxShadow: '0 4px 20px rgba(245, 99, 26, 0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        minHeight: 48,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700 }}>Atsiskaityti</span>
                      <span style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                        €{orderTotalEur.toFixed(2)}
                      </span>
                    </button>

                    <style>{`
                      .checkout-pay-row {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        width: 100%;
                        box-sizing: border-box;
                      }
                      .checkout-pay-chip {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex: 0 0 auto;
                        box-sizing: border-box;
                        height: 38px;
                        min-width: 3.25rem;
                        padding: 0 12px;
                        border-radius: 10px;
                        background: #ffffff;
                        border: 1px solid rgba(226, 232, 240, 0.95);
                        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 7px 20px rgba(15, 23, 42, 0.06);
                      }
                      .checkout-pay-chip img {
                        height: 20px;
                        width: auto;
                        max-height: 20px;
                        display: block;
                        object-fit: contain;
                        margin: 0;
                      }
                      .checkout-pay-chip__visa {
                        margin: 0;
                        padding: 0;
                        color: #1a1f71;
                        font-weight: 800;
                        font-size: 13px;
                        letter-spacing: 0.08em;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                      .checkout-ssl-banner {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 8px;
                        margin-top: 12px;
                        padding: 10px 14px;
                        border-radius: 14px;
                        background: #ffffff;
                        border: 1px solid rgba(226, 232, 240, 0.95);
                        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(15, 23, 42, 0.07);
                      }
                      .checkout-ssl-banner-cart {
                        font-size: 10.5px;
                        font-weight: 600;
                        color: #374151;
                      }
                    `}</style>
                    <div className="checkout-pay-row mt-3.5">
                      <div className="checkout-pay-chip">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                          alt="Mastercard"
                          loading="lazy"
                          decoding="async"
                          width={96}
                          height={20}
                        />
                      </div>
                      <div className="checkout-pay-chip">
                        <span className="checkout-pay-chip__visa">VISA</span>
                      </div>
                    </div>

                    <div className="checkout-ssl-banner">
                      <Lock style={{ width: 14, height: 14, flexShrink: 0, color: '#16a34a' }} aria-hidden />
                      <span className="checkout-ssl-banner-cart">256-bit SSL Secure Checkout</span>
                    </div>
                  </div>
                );
              })()}

              {/* Trust badges + mini reviews — below-fold trust block */}
              {totalItems > 0 && (
                <div style={{ marginTop: 28 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 14,
                      paddingLeft: 2,
                      paddingRight: 2,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ flex: 1, minWidth: 12, height: 1, backgroundColor: '#e5e7eb', borderRadius: 1 }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: '#9ca3af',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      KODĖL PIRKĖJAI MYLI MUS
                    </p>
                    <span
                      aria-hidden
                      style={{ flex: 1, minWidth: 12, height: 1, backgroundColor: '#e5e7eb', borderRadius: 1 }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { emoji: '🚀', tint: '#fff1e8', title: 'Greitas pristatymas', sub: '5–7 darbo dienos' },
                      { emoji: '✅', tint: '#f0fdf4', title: 'Kokybės garantija', sub: 'Aukštos kokybės medžiagos' },
                      { emoji: '🛡️', tint: '#e6f0ff', title: 'Saugus mokėjimas', sub: '256-bit šifravimas' },
                    ].map((b) => (
                      <div
                        key={b.title}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#ffffff',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 34,
                            height: 34,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: b.tint,
                            borderRadius: 10,
                            fontSize: 18,
                          }}
                        >
                          {b.emoji}
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
                          {b.title}
                        </span>
                        {b.sub ? (
                          <span style={{ fontSize: 10.5, color: '#9ca3af', lineHeight: 1.2 }}>{b.sub}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {/* Reviews summary */}
                  <div style={{ marginTop: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ color: '#F5631A', fontSize: 13, letterSpacing: '-0.04em' }}>★★★★★</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>4.9</span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        ({products?.[0]?.reviews ?? initialProducts[0]?.reviews ?? 53} atsiliepimai)
                      </span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: '#16a34a',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #bbf7d0',
                          padding: '2px 8px',
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check style={{ width: 10, height: 10 }} /> Tikri
                      </span>
                    </div>
                    <style>{`
                      .cart-reviews-scroll { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
                      .cart-reviews-scroll::-webkit-scrollbar { display: none; }
                      .cart-reviews-scroll { scrollbar-width: none; }
                      .cart-review-card { flex: 0 0 calc(50% - 5px); scroll-snap-align: start; }
                    `}</style>
                    <div
                      ref={cartReviewsScrollRef}
                      className="cart-reviews-scroll"
                      onScroll={onCartReviewsScroll}
                      role="region"
                      aria-label="Pirkėjų atsiliepimų juosta"
                    >
                      {CART_DRAWER_REVIEWS.map((r) => (
                        <div
                          key={r.name}
                          className="cart-review-card"
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            minWidth: 0,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <CartReviewerAvatar originalSrc={r.image} />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.1 }}>{r.name}</span>
                              <span style={{ fontSize: 10.5, color: '#9ca3af', lineHeight: 1.1 }}>{r.location}</span>
                            </div>
                          </div>
                          <span
                            aria-hidden
                            style={{ letterSpacing: '-0.04em', display: 'block', marginBottom: 4, fontSize: 10 }}
                          >
                            {[0, 1, 2, 3, 4].map((i) => (
                              <span key={i} style={{ color: i < r.rating ? '#F5631A' : '#e5e7eb' }}>★</span>
                            ))}
                          </span>
                          <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.4 }}>{r.text}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                      {CART_DRAWER_REVIEWS.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => scrollCartReviewToIndex(i)}
                          aria-label={`Rodyti atsiliepimą ${i + 1} iš ${CART_DRAWER_REVIEWS.length}`}
                          aria-current={i === cartReviewDotIndex ? 'true' : undefined}
                          style={{
                            padding: 0,
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0,
                            width: i === cartReviewDotIndex ? 18 : 6,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: i === cartReviewDotIndex ? '#F5631A' : '#e5e7eb',
                            transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Sidebar */}
      {wishlistOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className={`fixed right-0 top-0 w-full max-w-md bg-white shadow-xl overflow-y-auto ${wishlist.length === 0 ? 'h-auto max-h-full' : 'h-full'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{t.wishlist} • {wishlist.length}</h2>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">{language === 'lt' ? 'Jūsų pageidavimų sąrašas tuščias' : 'Your wishlist is empty'}</p>
                  <button
                    onClick={() => setWishlistOpen(false)}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {t.continueShopping}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((productId) => {
                    const product = products.find(p => p.id === productId);
                    return product ? (
                      <div key={productId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <OptimizedImage
                      src={product.image}
                      srcSet={productSrcSet(product.image)}
                      alt={`${product.name} - Pageidavimų sąraše`}
                      className="w-20 h-20 object-cover rounded"
                      loading="lazy"
                      decoding="async"
                      width={80}
                      height={80}
                      sizes="80px"
                    />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{product.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-bold text-brand-orange">€{product.price}</span>
                            <span className="text-sm text-gray-400 line-through">€{product.originalPrice}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setSelectedColor(0);
                              setSelectedSize(0);
                              setSelectedSizesByGroup(product.sizeGroups ? product.sizeGroups.map(() => 0) : []);
                              setQuantity(1);
                              setWishlistOpen(false);
                              setProductModalOpen(true);
                            }}
                            className="bg-brand-orange text-white px-3 py-1 rounded text-xs font-semibold hover:bg-brand-orange-hover min-h-[44px] flex items-center justify-center"
                          >
                            {t.viewProduct}
                          </button>
                          <button
                            onClick={() => addToWishlist(productId)}
                            className="text-gray-400 hover:text-brand-orange text-xs"
                          >
                            {language === 'lt' ? 'Pašalinti' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {productModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 product-modal-backdrop">
          <div className="product-modal-box w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 sm:p-8 pb-10">
              {/* Header with badge, rating and close button */}
              <div className="flex justify-between items-center product-modal-header">
                <div className="flex items-center flex-wrap gap-3 sm:gap-4">
                  <span className="product-modal-badge-popular">
                    POPULIARIAUSIAS
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < Math.round(selectedProduct.rating);
                        return (
                          <Star key={i} className={`w-4 h-4 ${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        );
                      })}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedProduct.rating} | {selectedProduct.reviews} Klientai
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="product-modal-close flex items-center justify-center flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Images */}
                <div>
                  <div className="product-modal-image-wrap mb-4 flex items-center justify-center overflow-hidden">
                    {(() => {
                      const imagesList = selectedProduct.imagesBySize
                        ? (selectedProduct.imagesBySize[selectedSize] || selectedProduct.images)
                        : (selectedProduct.imagesByColor
                            ? (selectedProduct.imagesByColor[selectedColor] || selectedProduct.images)
                            : selectedProduct.images);
                      const mainSrc = resolveImagePath(imagesList?.[selectedImageIndex] || selectedProduct.image);
                      return (
                    <OptimizedImage
                      src={mainSrc}
                      srcSet={productSrcSet(mainSrc)}
                      alt={`${selectedProduct.name} - Produkto nuotrauka`}
                      className="w-full h-full object-contain p-2 sm:p-3"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      fetchPriority="auto"
                    />
                      );
                    })()}
                  </div>
                  {(() => {
                    const hasBySize = !!selectedProduct.imagesBySize && selectedProduct.imagesBySize.length > 0;
                    const hasByColor = !!selectedProduct.imagesByColor && selectedProduct.imagesByColor.length > 0;
                    if (hasBySize) {
                      const flattened: { url: string; group: number; idx: number }[] = [];
                      selectedProduct.imagesBySize.forEach((group: string[], gIndex: number) => {
                        group.forEach((url: string, i: number) => flattened.push({ url, group: gIndex, idx: i }));
                      });
                      const thumbList = flattened.slice(0, 10);
                      return (
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                          {thumbList.map((t, i) => (
                            <button
                              key={`${t.group}-${t.idx}-${i}`}
                              onClick={() => { setSelectedSize(t.group); setSelectedImageIndex(t.idx); }}
                              className={`product-modal-thumb w-16 h-16 sm:w-20 sm:h-20 overflow-hidden touch-manipulation ${
                                (selectedSize === t.group && selectedImageIndex === t.idx) ? 'active' : ''
                              }`}
                              title={`Variantas ${t.group + 1}-${t.idx + 1}`}
                              aria-label={`${selectedProduct.name}, variantų grupė ${t.group + 1}, nuotrauka ${t.idx + 1}`}
                              aria-pressed={selectedSize === t.group && selectedImageIndex === t.idx}
                            >
                              <OptimizedImage
                                src={resolveImagePath(t.url)}
                                srcSet={productSrcSet(t.url)}
                                alt={`${selectedProduct.name} - Nuotrauka`}
                                className="w-full h-full object-contain p-1"
                                loading="lazy"
                                decoding="async"
                                width={64}
                                height={64}
                                sizes="64px"
                              />
                            </button>
                          ))}
                        </div>
                      );
                    }
                    if (hasByColor) {
                      const flattened: { url: string; group: number; idx: number }[] = [];
                      selectedProduct.imagesByColor.forEach((group: string[], gIndex: number) => {
                        group.forEach((url: string, i: number) => flattened.push({ url, group: gIndex, idx: i }));
                      });
                      const thumbList = flattened.slice(0, 10);
                      return (
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                          {thumbList.map((t, i) => (
                            <button
                              key={`${t.group}-${t.idx}-${i}`}
                              onClick={() => { setSelectedColor(t.group); setSelectedImageIndex(t.idx); }}
                              className={`product-modal-thumb w-16 h-16 sm:w-20 sm:h-20 overflow-hidden touch-manipulation ${
                                (selectedColor === t.group && selectedImageIndex === t.idx) ? 'active' : ''
                              }`}
                              title={`Variantas ${t.group + 1}-${t.idx + 1}`}
                              aria-label={`${selectedProduct.name}, spalvų grupė ${t.group + 1}, nuotrauka ${t.idx + 1}`}
                              aria-pressed={selectedColor === t.group && selectedImageIndex === t.idx}
                            >
                              <OptimizedImage
                                src={resolveImagePath(t.url)}
                                srcSet={productSrcSet(t.url)}
                                alt={`${selectedProduct.name} - Nuotrauka`}
                                className="w-full h-full object-contain p-1"
                                loading="lazy"
                                decoding="async"
                                width={64}
                                height={64}
                                sizes="64px"
                              />
                            </button>
                          ))}
                        </div>
                      );
                    }
                    // Fallback: no imagesBySize, show simple list
                    const imagesList = selectedProduct.images || [];
                    if (!imagesList.length) return null;
                    return (
                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {imagesList.slice(0, 6).map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`product-modal-thumb w-16 h-16 sm:w-20 sm:h-20 overflow-hidden touch-manipulation ${
                            selectedImageIndex === index ? 'active' : ''
                          }`}
                          title={`Variantas ${index + 1}`}
                          aria-label={`${selectedProduct.name}, nuotrauka ${index + 1} iš ${Math.min(imagesList.length, 6)}`}
                          aria-pressed={selectedImageIndex === index}
                        >
                          <OptimizedImage
                            src={resolveImagePath(img)}
                            srcSet={productSrcSet(img)}
                            alt={`${selectedProduct.name} - Nuotrauka ${index + 1}`}
                            className="w-full h-full object-contain p-1"
                            loading="lazy"
                            decoding="async"
                            width={64}
                            height={64}
                            sizes="64px"
                          />
                        </button>
                      ))}
                    </div>
                    );
                  })()}
                </div>

                {/* Right Column - Product Info */}
                <div>
                  <div className="mb-2">
                    <span className="product-modal-new-badge">
                      NAUJIENA: Šių metų būtinai reikalingas švenčių žavesys
                    </span>
                  </div>
                  <h1 className="product-modal-title">{selectedProduct.name}</h1>
                  
                  {/* Price */}
                  <div className="product-modal-price-wrap">
                    {(() => {
                      const variantPrice = (selectedProduct.pricesByColor && selectedProduct.pricesByColor[selectedColor] !== undefined)
                        ? selectedProduct.pricesByColor[selectedColor]
                        : (selectedProduct.pricesBySize && selectedProduct.pricesBySize[selectedSize] !== undefined)
                          ? selectedProduct.pricesBySize[selectedSize]
                          : selectedProduct.price;
                      const variantOriginal = (selectedProduct.originalPricesByColor && selectedProduct.originalPricesByColor[selectedColor] !== undefined)
                        ? selectedProduct.originalPricesByColor[selectedColor]
                        : (selectedProduct.originalPricesBySize && selectedProduct.originalPricesBySize[selectedSize] !== undefined)
                          ? selectedProduct.originalPricesBySize[selectedSize]
                          : selectedProduct.originalPrice;
                      return (
                        <>
                          <span className="product-modal-price">€{Number(variantPrice).toFixed(2)}</span>
                          <span className="product-modal-price-old">€{Number(variantOriginal).toFixed(2)}</span>
                          <span className="product-modal-discount-pill">
                            SUTAUPYKITE {selectedProduct.discount}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Description */}
                  <p className="product-modal-desc">{selectedProduct.description}</p>

                  {/* Features */}
                  <div className="product-modal-features">
                    {selectedProduct.features.map((feature: string, index: number) => (
                      <div key={index} className="product-modal-feature-row font-medium">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Color Selection */}
                  <div className="mb-4">
                    <h3 className="product-modal-option-label">Spalva</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => { setSelectedColor(index); if (selectedProduct.imagesByColor) setSelectedImageIndex(0); }}
                          className={`product-modal-option-btn touch-manipulation min-h-[44px] ${selectedColor === index ? 'active' : ''}`}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="mb-4">
                    <h3 className="product-modal-option-label">{selectedProduct.sizeLabel || 'Dydis'}</h3>
                    {selectedProduct.sizeGroups && selectedProduct.sizeGroups.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProduct.sizeGroups.map((group: any, gIndex: number) => (
                          <div key={gIndex} className="mb-2">
                            <div className="text-sm font-semibold text-gray-800 mb-2">{group.label}</div>
                            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible -mx-1 px-1 pb-1">
                              {group.sizes.map((size: any, sIndex: number) => (
                                <button
                                  key={sIndex}
                                  onClick={() => {
                                    setSelectedSizesByGroup(prev => {
                                      const next = [...prev];
                                      next[gIndex] = sIndex;
                                      return next;
                                    });
                                    setSelectedImageIndex(0);
                                  }}
                                  className={`product-modal-option-btn touch-manipulation min-h-[40px] min-w-[48px] shrink-0 ${(selectedSizesByGroup[gIndex] ?? 0) === sIndex ? 'active' : ''}`}
                                >
                                  {size.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {selectedProduct.sizes.map((size: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => { setSelectedSize(index); setSelectedImageIndex(0); }}
                            className={`product-modal-option-btn touch-manipulation min-h-[52px] min-w-[60px] ${selectedSize === index ? 'active' : ''}`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="mb-4">
                    <h3 className="product-modal-option-label">Kiekis</h3>
                    <div className="product-modal-qty-wrap">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="product-modal-qty-btn flex items-center justify-center touch-manipulation"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold w-12 text-center text-gray-900">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="product-modal-qty-btn flex items-center justify-center touch-manipulation"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Social Proof in Modal */}
                  <div className="bg-brand-guarantee border border-brand-green/40 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 text-green-800 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold text-sm">Neseniai užsakyta:</span>
                    </div>
                    <div className="space-y-1">
                      {recentOrders.slice(0, 2).map((order, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                          <span>{order.name} iš {order.location}</span>
                          <span>prieš {order.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
                      const effectivePrice = (selectedProduct.pricesByColor && selectedProduct.pricesByColor[selectedColor] !== undefined)
                        ? selectedProduct.pricesByColor[selectedColor]
                        : (selectedProduct.pricesBySize && selectedProduct.pricesBySize[selectedSize] !== undefined)
                          ? selectedProduct.pricesBySize[selectedSize]
                        : (typeof selectedProduct.price === 'number' ? selectedProduct.price : parseFloat(selectedProduct.price));
                      const imagesListForCart =
                        selectedProduct.imagesBySize
                          ? (selectedProduct.imagesBySize[selectedSize] || selectedProduct.images)
                          : (selectedProduct.imagesByColor
                              ? (selectedProduct.imagesByColor[selectedColor] || selectedProduct.images)
                              : selectedProduct.images);
                      const imageUrl = (imagesListForCart && imagesListForCart[selectedImageIndex]) || imagesListForCart?.[0] || selectedProduct.image;
                      const selectedSizeText = (selectedProduct.sizeGroups && selectedProduct.sizeGroups.length > 0)
                        ? selectedProduct.sizeGroups.map((group: any, gIndex: number) => {
                            const sIdx = selectedSizesByGroup[gIndex] ?? 0;
                            const sizeName = group.sizes[sIdx]?.name || '';
                            return `${group.label}: ${sizeName}`;
                          }).join(' | ')
                        : (selectedProduct.sizes[selectedSize]?.name || '');
                      addItem({
                        productId: selectedProduct.id,
                        name: selectedProduct.name,
                        price: effectivePrice,
                        image: imageUrl,
                        quantity: quantity,
                        selectedColor: selectedProduct.colors[selectedColor]?.name || '',
                        selectedSize: selectedSizeText,
                        sizeLabel: (selectedProduct as any).sizeGroups?.length ? 'Dydžiai' : ((selectedProduct as any).sizeLabel || 'Dydis')
                      });
                      setSuccessMessage(t.addedToCart);
                      setProductModalOpen(false);
                      setLoading(false);
                      setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                      className="product-modal-cta mb-3 disabled:opacity-50 min-h-[48px] cursor-pointer"
                  >
                    {loading ? (language === 'lt' ? 'Pridedama...' : 'Adding...') : t.addToCart}
                  </button>

                  {/* Note */}
                  <p className="product-modal-note">
                    Pastaba: Jūs prašėte. Mes papildėme atsargas (vėl). Ribotas kiekis!
                  </p>

                  {/* Service Guarantees */}
                  <div className="product-modal-guarantees">
                    <div className="product-modal-guarantee-item">
                      <Package className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Greitas Pristatymas</span>
                    </div>
                    <div className="product-modal-guarantee-item">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <span>Top pasirinkimas</span>
                    </div>
                    <div className="product-modal-guarantee-item">
                      <Headphones className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>24/7 VIP Pagalba</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={requestCheckoutClose}
          role="presentation"
        >
          <div
            className="bg-surface rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {STRIPE_PK ? (
              <Suspense fallback={<div className="flex items-center justify-center py-12 text-gray-600">Kraunama...</div>}>
              <CheckoutStripeLoader
                payRef={stripePayRef}
                orderIdRef={orderIdRef}
                customer={{
                  name: checkoutFormData.name,
                  surname: checkoutFormData.surname,
                  email: checkoutFormData.email,
                  phone: checkoutFormData.phone,
                  address: `${checkoutFormData.address}, ${checkoutFormData.city} ${checkoutFormData.postalCode}`,
                }}
                items={cartItems.map((it: any) => ({
                  productId: it.productId,
                  name: it.name,
                  selectedColor: it.selectedColor ?? '',
                  selectedSize: it.selectedSize ?? '',
                  quantity: Number(it.quantity || 1)
                }))}
                giftWrapping={!!giftWrapping}
              >
              {(card) => (
              <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Apmokėjimas</h2>
                <button
                  type="button"
                  onClick={requestCheckoutClose}
                  className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Užverti apmokėjimą"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Forms */}
                <div className="space-y-4">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-base font-semibold mb-2">Kontaktinė Informacija</h3>
                    <div>
                      <input
                        type="email"
                        placeholder="El. paštas (pvz., vardas@gmail.com)"
                        value={checkoutFormData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-base font-semibold mb-2">Pristatymo Adresas</h3>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Vardas"
                          value={checkoutFormData.name}
                          onChange={(e) => handleInputChange('name', e.target.value.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]/g, ''))}
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <input
                          type="text"
                          placeholder="Pavardė"
                          value={checkoutFormData.surname}
                          onChange={(e) => handleInputChange('surname', e.target.value.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]/g, ''))}
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.surname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                          }`}
                        />
                        {formErrors.surname && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.surname}</p>
                        )}
                      </div>
                      
                      <div>
                        <input
                          type="text"
                          placeholder="Adresas (gatvė, namo nr., buto nr.)"
                          value={checkoutFormData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                          }`}
                        />
                        {formErrors.address && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Miestas"
                            value={checkoutFormData.city}
                            onChange={(e) => handleInputChange('city', e.target.value.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]/g, ''))}
                            className={`p-2 border rounded-lg focus:outline-none focus:ring-2 w-full ${
                              formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                            }`}
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                          )}
                        </div>
                        
                        <div>
                          <input
                            type="text"
                            placeholder="Rajonas (neprivaloma)"
                            value={checkoutFormData.region}
                            onChange={(e) => handleInputChange('region', e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Pašto kodas (5 skaitmenys)"
                          value={checkoutFormData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                          maxLength={5}
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                          }`}
                        />
                        {formErrors.postalCode && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>
                        )}
                      </div>
                      
                      <div>
                        <input
                          type="tel"
                          inputMode="tel"
                          placeholder="Telefonas (pvz., +37060000000)"
                          value={checkoutFormData.phone}
                          onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <h3 className="text-base font-semibold">Mokėjimo Informacija</h3>
                    </div>
                    {card}
                  </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Užsakymo Santrauka</h3>
                  
                  {/* Products in Order */}
                  <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                    {cartItems.map((item) => {
                      const isMystery = item.productId === MYSTERY_GIFT.productId;
                      return (
                      <div
                        key={item.id}
                        className={
                          isMystery
                            ? 'flex items-center gap-3 rounded-xl border border-emerald-300/55 bg-emerald-50 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_6px_20px_rgba(15,23,42,0.04)]'
                            : 'flex items-center gap-3 rounded-xl border border-[#E0E0E0] bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_10px_28px_rgba(15,23,42,0.07)]'
                        }
                      >
                        {isMystery ? (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-emerald-300/25 bg-emerald-50 shadow-[0_1px_4px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,118,110,0.1)] sm:h-14 sm:w-14">
                            <img
                              src={MYSTERY_GIFT.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center scale-[1.18]"
                              style={{ transformOrigin: 'center center' }}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg border border-[#E0E0E0] bg-white object-cover shadow-[0_1px_4px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.06)]"
                          loading="lazy"
                          decoding="async"
                        />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm sm:text-base line-clamp-1">{item.name}</h4>
                          {isMystery ? (
                            <div className="mt-0.5 space-y-0.5 text-[11px] text-gray-600 sm:text-xs">
                              <p className="font-medium leading-snug">Tipas: {MYSTERY_GIFT.selectedSize}</p>
                              <p className="font-medium leading-snug">Spalva: {MYSTERY_GIFT.selectedColor}</p>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs sm:text-sm font-semibold text-gray-700">Kiekis: {item.quantity}</p>
                              {item.selectedColor && (
                                <p className="text-xs text-gray-600 font-semibold">Spalva: {item.selectedColor}</p>
                              )}
                              {item.selectedSize && (
                                <p className="text-xs text-gray-600 font-semibold">Šautuvo tipas: {(item.selectedSize as string).split(', ')[0] || item.selectedSize}</p>
                              )}
                            </>
                          )}
                          {isMystery ? (
                            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="text-[11px] font-medium text-gray-400 line-through sm:text-xs">
                                €{MYSTERY_GIFT.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-sm font-extrabold text-red-600 sm:text-base">
                                €{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <p className="font-bold text-red-600 text-sm sm:text-base">€{(item.price * item.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm sm:text-base font-semibold">
                      <span>{t.subtotal}</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base font-semibold">
                      <span>{t.shipping}</span>
                      <span className={isFreeShipping ? "text-brand-green" : "text-gray-600"}>
                        {isFreeShipping ? (language === 'lt' ? 'Nemokamas' : 'Free') : '€2.99'}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-3 mb-4">
                    {giftWrapping && (
                      <div className="flex justify-between text-sm sm:text-base font-semibold">
                        <span>{t.giftWrapping}</span>
                        <span>€2.99</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg sm:text-xl font-extrabold">
                      <span>{t.orderTotal}</span>
                      <span>€{(orderCents / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <hr className="my-6 border-gray-300" />

                  {/* Consent */}
                  

                  {/* Place Order Button */}
                  <button 
                    onClick={async () => {
                      if ((import.meta as any).env?.DEV) console.log('[Checkout] Clicked place order');
                      try {
                        setLoading(true);
                        setFormErrors({});
                        
                        const errors = validateForm(checkoutFormData);
                        if (Object.keys(errors).length > 0) {
                          setFormErrors(errors);
                          setErrorMessage('Prašome taisyklingai užpildyti visus privalomus laukus');
                          setTimeout(() => setErrorMessage(''), 3000);
                          setLoading(false);
                          return;
                        }
                        
                        // Trigger Stripe payment via bridge
                        const payInvoker = stripePayRef.current;
                        if (!payInvoker) {
                          if ((import.meta as any).env?.DEV) console.warn('[Checkout] Stripe pay bridge not ready, falling back to Checkout Session');
                        }
                        orderIdRef.current = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                        const payResult = await (payInvoker ? payInvoker() : Promise.resolve({ ok: false, error: 'Mokėjimo sistema nepasiruošusi' }));
                        if (!payResult.ok) {
                          // Fallback to Stripe Checkout (hosted) when Elements fails/blocked
                          try {
                            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                            if ((import.meta as any).env?.DEV) console.log('[Checkout] Creating Checkout Session...');
                            const csResp = await fetch('/api/create-checkout-session', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: checkoutFormData.name,
                                surname: checkoutFormData.surname,
                                email: checkoutFormData.email,
                                phone: checkoutFormData.phone,
                                address: `${checkoutFormData.address}, ${checkoutFormData.city} ${checkoutFormData.postalCode}`,
                                items: cartItems.map((it: any) => ({
                                  productId: it.productId,
                                  name: it.name,
                                  selectedColor: it.selectedColor ?? '',
                                  selectedSize: it.selectedSize ?? '',
                                  quantity: Number(it.quantity || 1)
                                })),
                                orderId: orderNumber,
                                giftWrapping: !!giftWrapping
                              })
                            });
                            if ((import.meta as any).env?.DEV) console.log('[Checkout] Checkout Session response status:', csResp.status);
                            if (csResp.ok) {
                              const { id, url } = await csResp.json();
                              if ((import.meta as any).env?.DEV) console.log('[Checkout] Got session', id, 'url', url);
                              // Prefer native redirect via returned URL to avoid SDK being blocked
                              if (url) {
                                window.location.href = url;
                                return;
                              }
                              const { loadStripe } = await import('@stripe/stripe-js');
                              const stripeClient = await loadStripe(STRIPE_PK);
                              await stripeClient?.redirectToCheckout({ sessionId: id });
                              setLoading(false);
                              return;
                            }
                          } catch (e) {
                            if ((import.meta as any).env?.DEV) console.error('[Checkout] Fallback to Checkout Session failed', e);
                            // fallthrough to show error
                          }
                          setErrorMessage(payResult.error || 'Mokėjimas nepavyko.');
                          setLoading(false);
                          return;
                        }
                        
                        const orderNumber = orderIdRef.current || `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                        const order = {
                          id: Date.now(),
                          items: totalItems,
                          total: (orderCents / 100).toFixed(2),
                          giftWrapping,
                          date: new Date().toLocaleDateString('lt-LT'),
                          status: 'Apdorojama',
                          orderNumber
                        };

                        // Mark paid and notify Discord (client-side fallback in case webhook fails)
                        order.status = 'Apmokėta';
                        try {
                          await fetch('/api/notify-discord', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              provider: 'stripe',
                              orderNumber,
                              total: (orderCents / 100).toFixed(2),
                              customer: {
                                name: checkoutFormData.name,
                                surname: checkoutFormData.surname,
                                email: checkoutFormData.email,
                                phone: checkoutFormData.phone,
                                address: `${checkoutFormData.address}, ${checkoutFormData.city} ${checkoutFormData.postalCode}`,
                              },
                              items: cartItems.map((it: any) => ({
                                name: it.name,
                                quantity: Number(it.quantity || 1),
                                price: Number(it.price),
                                selectedColor: it.selectedColor || ''
                              }))
                            })
                          });
                        } catch {}
                        // Confirmation email is sent from Stripe webhook (payment_intent.succeeded)
                        
                        setOrderHistory([order, ...orderHistory]);
                        setCompletedOrderNumber(orderNumber);
                        setCompletedOrderEmail(checkoutFormData.email);
                        setCheckoutOpen(false);
                        setThankYouModalOpen(true);
                        // Meta Pixel: Purchase event
                        try {
                          const w: any = (typeof window !== 'undefined') ? window : null;
                          if (w && typeof w.fbq === 'function') {
                            w.fbq('track', 'Purchase', {
                              value: Number((orderCents / 100).toFixed(2)),
                              currency: 'EUR',
                              contents: cartItems.map((it: any) => ({
                                id: it.productId,
                                quantity: it.quantity,
                              })),
                              content_type: 'product',
                            });
                          }
                        } catch {}
                        clearCart();
                        setGiftWrapping(false);
                        
                        // Reset form
                        setCheckoutFormData({
                          email: '',
                          name: '',
                          surname: '',
                          address: '',
                          city: '',
                          region: '',
                          postalCode: '',
                          phone: '',
                          cardNumber: '',
                          expiry: '',
                          cvv: ''
                        });
                      } catch (error) {
                        setErrorMessage('Įvyko klaida. Bandykite dar kartą.');
                        setTimeout(() => setErrorMessage(''), 3000);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-2 rounded-lg font-semibold transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {loading ? t.processing : t.placeOrder}
                  </button>

                  <style>{`
                    .checkout-pay-row {
                      display: flex;
                      flex-wrap: wrap;
                      align-items: center;
                      justify-content: center;
                      gap: 10px;
                      width: 100%;
                      box-sizing: border-box;
                    }
                    .checkout-pay-chip {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex: 0 0 auto;
                      box-sizing: border-box;
                      height: 38px;
                      min-width: 3.25rem;
                      padding: 0 12px;
                      border-radius: 10px;
                      background: #ffffff;
                      border: 1px solid rgba(226, 232, 240, 0.95);
                      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 7px 20px rgba(15, 23, 42, 0.06);
                    }
                    .checkout-pay-chip img {
                      height: 20px;
                      width: auto;
                      max-height: 20px;
                      display: block;
                      object-fit: contain;
                      margin: 0;
                    }
                    .checkout-pay-chip__visa {
                      margin: 0;
                      padding: 0;
                      color: #1a1f71;
                      font-weight: 800;
                      font-size: 13px;
                      letter-spacing: 0.08em;
                      line-height: 1;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .checkout-ssl-banner {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                      margin-bottom: 1rem;
                      padding: 10px 14px;
                      border-radius: 14px;
                      background: #ffffff;
                      border: 1px solid rgba(226, 232, 240, 0.95);
                      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(15, 23, 42, 0.07);
                    }
                  `}</style>
                  <div className="checkout-pay-row mb-2.5">
                    <div className="checkout-pay-chip">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                        alt="Mastercard"
                        loading="lazy"
                        decoding="async"
                        width={96}
                        height={20}
                      />
                    </div>
                    <div className="checkout-pay-chip">
                      <span className="checkout-pay-chip__visa">VISA</span>
                    </div>
                  </div>

                  <div className="checkout-ssl-banner">
                    <Lock className="w-4 h-4 text-brand-green flex-shrink-0" />
                    <span className="text-xs text-gray-700 font-semibold">256-bit SSL Secure Checkout</span>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center">
                    Pateikdami užsakymą, sutinkate su mūsų Taisyklėmis ir Sąlygomis
                  </p>
                </div>
              </div>
              </>
              )}
              </CheckoutStripeLoader>
              </Suspense>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-brand-urgency font-semibold">
                    Kortelių mokėjimai laikinai nepasiekiami (neteisingas Stripe raktas).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && checkoutLeaveConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-leave-title"
          aria-describedby="checkout-leave-desc"
          onClick={() => setCheckoutLeaveConfirmOpen(false)}
        >
          <div
            className="relative bg-surface rounded-2xl max-w-[420px] w-full overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] border-2 border-cta/45 ring-1 ring-cta/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="checkout-leave-confetti pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className={`relative px-5 sm:px-7 pt-8 pb-5 ${mysteryInCart ? 'pt-10' : ''}`}>
              <div className="flex justify-center mb-4">
                {mysteryInCart ? (
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-200/90 bg-gradient-to-b from-amber-50 to-amber-100/90 shadow-inner">
                      <Gift className="h-8 w-8 text-cta" strokeWidth={2} aria-hidden="true" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-b from-sky-50 to-white shadow-inner">
                    <Sparkles className="h-8 w-8 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                )}
              </div>
              <h3 id="checkout-leave-title" className="text-center text-xl font-extrabold text-text leading-tight tracking-tight">
                {t.checkoutLeaveAlmostDone}
              </h3>
              <p id="checkout-leave-desc" className="text-sm text-muted mt-3 leading-relaxed text-center">
                {language === 'lt' ? (
                  mysteryInCart ? (
                    <>
                      Tavo{' '}
                      <strong className="font-bold text-cta">{MYSTERY_GIFT.name}</strong> ir užsakymas jau supakuoti.
                      Išėjus dabar, tavo rezervacija bus anuliuota po{' '}
                      <span className="font-mono font-bold text-red-600 tabular-nums text-[0.95em]">
                        {formatCheckoutLeaveTimer(checkoutLeaveTimerSec)}
                      </span>{' '}
                      min.
                    </>
                  ) : (
                    <>
                      Tavo užsakymas jau paruoštas. Išėjus dabar, rezervacija bus anuliuota po{' '}
                      <span className="font-mono font-bold text-red-600 tabular-nums text-[0.95em]">
                        {formatCheckoutLeaveTimer(checkoutLeaveTimerSec)}
                      </span>{' '}
                      min.
                    </>
                  )
                ) : mysteryInCart ? (
                  <>
                    Your <strong className="font-bold text-cta">Mystery Gift</strong> and order are ready to go. If you
                    leave now, your spot is released after{' '}
                    <span className="font-mono font-bold text-red-600 tabular-nums text-[0.95em]">
                      {formatCheckoutLeaveTimer(checkoutLeaveTimerSec)}
                    </span>{' '}
                    min.
                  </>
                ) : (
                  <>
                    Your order is ready. If you leave now, your reservation ends in{' '}
                    <span className="font-mono font-bold text-red-600 tabular-nums text-[0.95em]">
                      {formatCheckoutLeaveTimer(checkoutLeaveTimerSec)}
                    </span>{' '}
                    min.
                  </>
                )}
              </p>
              <div className="mt-6 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setCheckoutLeaveConfirmOpen(false)}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#ff9426] via-cta to-[#e05f00] px-5 py-4 text-center shadow-[0_14px_40px_-6px_rgba(255,122,0,0.75),0_4px_0_rgba(0,0,0,0.08)_inset] transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 motion-safe:animate-pulse sm:py-[1.15rem]"
                >
                  <span className="flex items-center justify-center gap-2 text-base font-extrabold uppercase tracking-wide text-white drop-shadow-sm sm:text-lg">
                    {mysteryInCart ? t.checkoutLeaveStayMystery : t.checkoutLeaveStayCta}
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={closeCheckoutConfirmed}
                  className="w-full py-1.5 text-center text-[11px] font-normal leading-snug text-muted/45 transition hover:text-muted/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-border/60 rounded-md sm:text-xs"
                >
                  {mysteryInCart ? t.checkoutLeaveExitMystery : t.checkoutLeaveConfirm}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-border/70 bg-slate-50/95 px-5 py-3.5 sm:px-7">
              <div className="flex shrink-0 -space-x-2" aria-hidden="true">
                <span className="inline-block h-8 w-8 rounded-full border-2 border-surface bg-primary shadow-sm" />
                <span className="inline-block h-8 w-8 rounded-full border-2 border-surface bg-emerald-500 shadow-sm" />
                <span className="inline-block h-8 w-8 rounded-full border-2 border-surface bg-amber-400 shadow-sm" />
              </div>
              <p className="min-w-0 text-[10px] font-bold uppercase leading-snug tracking-[0.06em] text-muted sm:text-[11px]">
                {t.checkoutLeaveSocialProof.replace('{n}', String(checkoutLiveBuyersCount))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal – lazy loaded, only shown after checkout */}
      {thankYouModalOpen ? (
        <Suspense fallback={null}>
          <ThankYouModal
            isOpen={thankYouModalOpen}
            onClose={() => setThankYouModalOpen(false)}
            orderNumber={completedOrderNumber}
            email={completedOrderEmail}
          />
        </Suspense>
      ) : null}

      {/* Cookie Consent Banner */}
      {showCookie ? <Suspense fallback={null}><CookieConsent /></Suspense> : null}

      {/* Social Proof Toast */}
      <Suspense fallback={null}>
        <SocialProofToast checkoutOpen={checkoutOpen} isMobile={isMobile} displayedStockLeft={pdpDisplayedStockLeft} />
      </Suspense>
    </div>
    </>
  );
}


function ProductCatalogBootstrap() {
  const setProducts = useProductStore((s) => s.setProducts);
  useEffect(() => {
    setProducts(initialProducts);
  }, [setProducts]);
  return null;
}

// --- Main Router ---
export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">💦</div>
          <div className="text-xl font-bold text-brand-blue-deep">Vasaros Kampelis</div>
          <div className="text-gray-600 mt-2">Kraunama...</div>
        </div>
      </div>
    }>
      <ProductCatalogBootstrap />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/p/:id" element={<HomePage />} />
        <Route path="/apie-mus" element={<ApieMus />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/kaip-sukurti-vasaros-nuotaika-namuose" element={<BlogPostVasaraNamuose />} />
        <Route path="/blog/vasaros-pasiulymai-ir-idejos-2025" element={<Navigate to="/blog/vasaros-pasiulymai-ir-idejos-2026" replace />} />
        <Route path="/blog/vasaros-pasiulymai-ir-idejos-2026" element={<BlogPostVasarosPasiulymai2025 />} />
        <Route path="/blog/kaip-puosti-kiema-vandens-zaidimams" element={<BlogPostKiemasVandens />} />
        <Route path="/blog/10-paprastu-budu-megautis-vasara-lauke" element={<BlogPost10BuduVasara />} />
        <Route path="/blog/kaip-pasiruosti-vasarai-be-streso" element={<BlogPostVasaraBeStreso />} />
        <Route path="/blog/vandens-musiu-organizavimas" element={<BlogPostVandensMusiai />} />
        <Route path="/blog/vandens-zaidimai-vaikams" element={<BlogPostVandensZaidimaiVaikams />} />
        <Route path="/blog/kaip-issirinkti-vandens-blasteri" element={<BlogPostKaipIssirinktiBlasteri />} />
        <Route path="/blog/pikniko-idejos-vasarai" element={<BlogPostPiknikoIdejos />} />
        <Route path="/blog/gimtadienis-lauke-vaikams" element={<BlogPostGimtadienisLaukeVaikams />} />
        <Route path="/blog/ka-veikti-su-vaikais-vasara" element={<BlogPostKaVeiktiSuVaikaisVasara />} />
        <Route path="/blog/vandens-sautuvas-vs-pistoletas" element={<BlogPostVandensSautuvasVsPistoletas />} />
        <Route path="/blog/vasaros-dovanos-vaikams" element={<BlogPostVasarosDovanosVaikams />} />
        <Route path="/pristatymo-info" element={<PristatymoInfo />} />
        <Route path="/grazinimai" element={<Grazinimai />} />
        <Route path="/kontaktai" element={<Kontaktai />} />
        <Route path="/privatumo-politika" element={<PrivatumoPolitika />} />
        <Route path="/slapuku-politika" element={<SlapukuPolitika />} />
      </Routes>
    </Suspense>
  );
}

