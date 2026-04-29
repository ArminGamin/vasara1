import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from "react";
import {
  ShoppingCart,
  Heart,
  X,
  Star,
  Mail,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Gift,
  Trash2,
  Check,
  Package,
  CreditCard,
  Lock,
  ShieldCheck,
  Share2,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import OptimizedImage from "./components/OptimizedImage";
import { LazyVideo } from "./components/LazyVideo";
// Loaded on idle via simple state gating below to avoid layout thrash
import { useCartStore } from "./store/cartStore";
import { useProductStore } from "./store/productStore";
import { initialProducts } from "./data/products";
import { SITE_NAME, DEFAULT_DESC } from './components/PageWrapper';
// Lazy-load below-fold components – defers framer-motion and reduces main-thread work
const CookieConsent = lazy(() => import("./components/CookieConsent").then((m) => ({ default: m.default })));
const LanguageDetectionPopup = lazy(() => import("./components/LanguageDetectionPopup").then((m) => ({ default: m.LanguageDetectionPopup })));
const ComparisonTable = lazy(() => import("./components/ComparisonTable").then((m) => ({ default: m.ComparisonTable })));
const ReviewsSection = lazy(() => import("./components/ReviewsSection").then((m) => ({ default: m.ReviewsSection })));
const WhyChooseUs = lazy(() => import("./components/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })));
const FAQAccordion = lazy(() => import("./components/FAQAccordion").then((m) => ({ default: m.FAQAccordion })));
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
const BlogPostKaipIssirinktiBlasteri = lazy(() => import("./pages/blog/BlogPostKaipIssirinktiBlasteri").then(m => ({ default: m.default })));
const BlogPostPiknikoIdejos = lazy(() => import("./pages/blog/BlogPostPiknikoIdejos").then(m => ({ default: m.default })));

function heroSrcSet(base: string) {
  const b = base.replace(/\.webp$/, '');
  return `${b}-480w.webp 480w, ${b}-768w.webp 768w, ${b}-1024w.webp 1024w, ${base} 1920w`;
}
// Product images (blue1.webp, pink2.webp, etc.) have 306/512/612/1024w variants from prebuild
const PRODUCT_WIDTHS = [306, 512, 612, 1024];
function productSrcSet(path: string): string | undefined {
  const normalized = path.startsWith('/') ? path : '/' + path;
  if (!/^\/(blue|pink|bluepistol|pinkpistol)\d+\.webp$/i.test(normalized)) return undefined;
  const base = normalized.replace(/\.webp$/i, '');
  return PRODUCT_WIDTHS.map((w) => `${base}-${w}w.webp ${w}w`).join(', ');
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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
  // Free shipping threshold uses FLOOR of subtotal cents (no rounding up to qualify)
  const freeShippingCents = 8000; // €80.00
  const subtotalCentsFloor = useMemo(() => (
    cartItems.reduce((sum: number, it: any) => {
      const priceCentsFloor = Math.floor(Number(it.price) * 100);
      return sum + priceCentsFloor * Number(it.quantity || 1);
    }, 0)
  ), [cartItems]);
  const isFreeShipping = subtotalCentsFloor >= freeShippingCents;
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
      // Prefetch in small bursts to avoid blocking other requests
      for (let k = 0; k < 3 && index < sources.length; k++, index++) {
        const src = sources[index];
        const img = new Image();
        (img as any).loading = 'eager';
        img.decoding = 'async';
        img.src = src;
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
    },
  };

  const t = translations[language];
  const { products: storeProducts } = useProductStore();
  
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
      className="min-h-screen flex flex-col bg-bg touch-action-pan-y"
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
                transitTime: { "@type": "QuantitativeValue", minValue: 8, maxValue: 12, unitCode: "d" }
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
      <header className="storefront-header ios-safe-area shrink-0">
        <div className="storefront-header-emoji-deco" aria-hidden>
          <span>☀️</span>
          <span>🌴</span>
          <span>💦</span>
          <span>🌊</span>
          <span>🏖️</span>
          <span>🍉</span>
          <span>🌻</span>
          <span>⛱️</span>
          <span>🍋</span>
          <span>🐚</span>
          <span>🌴</span>
          <span>☀️</span>
          <span>🌊</span>
        </div>
        <div className="storefront-header-top">
          <div className="min-h-[44px]" aria-hidden />
          <Link to="/" className="storefront-logo">{t.shopName}</Link>
          <div className="flex items-center justify-end gap-1 sm:gap-2 min-h-[44px]">
            <button
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-muted hover:text-cta hover:bg-promoBg/50 transition"
              onClick={() => setWishlistOpen((s) => !s)}
              title={t.wishlist}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cta text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-muted hover:text-cta hover:bg-promoBg/50 transition"
              onClick={() => setCartOpen(true)}
              title={t.cart}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cta text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        <nav className="storefront-nav-row" aria-label={language === 'lt' ? 'Pagrindinė navigacija' : 'Main navigation'}>
          <Link to="/">{language === 'lt' ? '☀️ Pagrindinis' : '☀️ Home'}</Link>
          <Link to="/kontaktai">{language === 'lt' ? '💬 Kontaktai' : '💬 Contact'}</Link>
          <a href="#products">{language === 'lt' ? '💦 Šautuvai' : '💦 Products'}</a>
        </nav>
      </header>

      {/* Scrolling promo strip – product features (seamless marquee) */}
      <div className="storefront-promo-strip shrink-0">
        <div className="storefront-promo-track">
          {[0, 1, 2, 3].map((copy) => (
            <div key={copy} className="storefront-promo-set" aria-hidden={copy > 0 ? true : undefined}>
              <span>💦 Šaudo iki 10 metrų atstumu</span>
              <span>➔</span>
              <span>🚀 Pilnai automatinis režimas</span>
              <span>➔</span>
              <span>💧 Didelė vandens talpa</span>
              <span>➔</span>
              <span>🖐 Stabilus ir patogus laikymas</span>
              <span>➔</span>
              <span>🎯 Lengvas taktinio stiliaus dizainas</span>
              <span>➔</span>
            </div>
          ))}
        </div>
      </div>

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
                src="/Promo1.mp4"
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls
                aria-label="Promo 1"
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

      {/* Products – one big section with inline variant selection */}
      <main id="products" className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-14 flex-1">
        <h2 className="revo-section-title text-center mb-2">{t.products}</h2>
        <p className="revo-section-sub text-center mb-10 pl-6 pr-1">Tegul prasideda tikras vasaros mūšis! 🚀</p>
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
          return (
            <div className="product-section-card w-full max-w-full min-h-[min(75vh,750px)] lg:min-h-[min(80vh,900px)] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0 h-full min-h-[min(75vh,750px)] lg:min-h-[min(80vh,900px)] w-full">
                {/* Left: image updates by variant */}
                <div className="product-section-image relative min-h-[320px] lg:min-h-0 lg:h-full w-full min-w-0 max-w-full flex flex-col items-center justify-center p-3 lg:p-4 overflow-hidden">
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
                      {t.newBadge}
                    </span>
                  )}
                  <div className="flex-1 w-full min-w-0 min-h-0 lg:min-h-[min(55vh,520px)] flex items-center justify-center overflow-hidden">
                    <OptimizedImage
                      src={currentImage}
                      srcSet={productSrcSet(currentImage)}
                      alt={`${product.name} – ${variantName}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300"
                      loading="eager"
                      decoding="async"
                      width={600}
                      height={600}
                      sizes="(max-width: 768px) 50vw, 550px"
                    />
                  </div>
                  {currentVariantImages.length > 1 && (
                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                      {currentVariantImages.map((url: string, i: number) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSectionImageIndex(i)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${
                            sectionImageIndex === i ? 'border-cta ring-4 ring-cta/50' : 'border-border'
                          }`}
                        >
                          <OptimizedImage src={resolveImagePath(url)} srcSet={productSrcSet(url)} alt="" className="w-full h-full object-cover" width={64} height={64} sizes="64px" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Right: variant selector, price, qty, add to cart */}
                <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2.5 mb-4">
                    {renderStars(product.rating, 'w-5 h-5')}
                    <span className="text-base font-medium text-muted">{product.rating} ({product.reviews})</span>
                  </div>
                  <h3 className="revo-product-card-title text-2xl sm:text-3xl mb-3">{product.name}</h3>
                  <p className="text-muted text-base font-medium mb-4">{product.description}</p>
                  {/* Features */}
                  <div className="mb-5 space-y-2">
                    {product.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-text font-medium">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  {/* Variant selectors */}
                  {sizeGroups.map((group: { label: string; sizes: { name: string; value: string }[] }, gIndex: number) => (
                    <div key={gIndex} className="mb-4">
                      <p className="text-base font-bold text-text mb-3">{group.label}</p>
                      <div className="flex flex-wrap gap-3">
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
                            className={`product-section-variant px-5 py-3 rounded-xl text-base font-semibold border-2 border-border text-text ${
                              (sectionSizesByGroup[gIndex] ?? 0) === idx ? 'active' : 'bg-bg'
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Price */}
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-3xl font-bold text-cta">€{currentPrice.toFixed(2)}</span>
                    {currentOriginal > currentPrice && (
                      <>
                        <span className="text-lg text-muted line-through">€{currentOriginal.toFixed(2)}</span>
                        <span className="bg-cta text-white text-lg font-bold px-4 py-2 rounded-full shadow-md">-22%</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium text-red-600 mb-4">⏳ Paskubėk, sandėlyje liko tik {typeIdx === 1 ? 16 : 12} vnt!</p>
                  {/* Quantity + Add to cart */}
                  <div className="flex flex-wrap items-center gap-4 mb-5">
                    <div className="flex items-center rounded-xl border-2 border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSectionQuantity(Math.max(1, sectionQuantity - 1))}
                        className="w-12 h-12 flex items-center justify-center bg-bg hover:bg-primary/10 text-text font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="w-12 h-12 flex items-center justify-center font-bold text-lg text-text border-x border-border">{sectionQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setSectionQuantity(sectionQuantity + 1)}
                        className="w-12 h-12 flex items-center justify-center bg-bg hover:bg-primary/10 text-text font-bold text-lg"
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
                      className="product-section-cta flex-1 min-w-[180px] py-4 px-6 rounded-xl text-white font-bold text-base border-0"
                    >
                      {t.addToCart}
                    </button>
                  </div>
                  <div className="min-h-[1.75rem] mb-4">
                    {sectionAddSuccess && (
                      <p className="text-green-600 font-semibold text-sm sm:text-base">
                        Pridėta į krepšelį!
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-text">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-primary" />
                      Greitas Pristatymas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Top pasirinkimas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-primary" />
                      24/7 Pagalba
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
      <Suspense fallback={null}><ReviewsSection /></Suspense>
          </div>
        </section>

        {/* Section 6: FAQ + Newsletter + Footer – no bottom padding so footer is last */}
        <section ref={(el) => { sectionRefs.current[4] = el; }} className="snap-slide snap-auto bg-bg" style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
          <div className="slide-content w-full">
      <Suspense fallback={null}><FAQAccordion /></Suspense>

      {/* Newsletter */}
      <section className="relative bg-primary text-white py-8 md:py-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden cv-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <div className="max-w-6xl mx-auto">
          <Mail className="mx-auto mb-3 w-10 h-10" />
          <h3 className="text-2xl font-bold mb-2">
            Sužinokite pirmi apie naujienas!
          </h3>
          <p className="text-sm mb-4">
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
            <button disabled={isSubmittingNewsletter} className={`bg-surface text-primaryDark font-semibold px-6 py-3 rounded-md hover:bg-border min-h-[48px] shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${isSubmittingNewsletter ? 'opacity-60 cursor-not-allowed' : ''}`}>
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
      </section>

      {/* Footer – inside section 9; footer color */}
      <footer className="relative bg-footer text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center md:justify-items-start text-center md:text-left">
          <div>
            <h4 className="font-bold text-lg mb-3">{t.shopName}</h4>
            <p>
              <Link to="/apie-mus" className="hover:text-white cursor-pointer font-semibold text-white/90">
                Apie mus
              </Link>
            </p>
            <p className="mt-1">
              <Link to="/blog" className="hover:text-white cursor-pointer font-semibold text-white/90">
                Blogas
              </Link>
            </p>
            <p className="mt-1">
              <Link to="/kontaktai" className="hover:text-white cursor-pointer font-semibold text-white/90">
                Kontaktai
              </Link>
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-3">Teisinė informacija</h5>
            <ul className="text-sm space-y-2 text-white/80">
              <li>
                <Link to="/pristatymo-info" className="hover:text-white cursor-pointer font-semibold">
                  Pristatymo Info
                </Link>
              </li>
              <li>
                <Link to="/grazinimai" className="hover:text-white cursor-pointer font-semibold">
                  Grąžinimai
                </Link>
              </li>
              <li>
                <Link to="/privatumo-politika" className="hover:text-white cursor-pointer font-semibold">
                  Privatumo Politika
                </Link>
              </li>
              <li>
                <Link to="/slapuku-politika" className="hover:text-white cursor-pointer font-semibold">
                  Slapukų politika
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">Kontaktai</h5>
            <ul className="text-sm space-y-2 text-white/80">
              <li className="flex items-center gap-3 py-1">
                <Mail className="w-5 h-5 block shrink-0" />
                <span className="inline-flex items-center h-5 font-semibold">vasaroskampelis@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 py-1">
                <img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" className="w-5 h-5 block shrink-0" loading="lazy" decoding="async" />
                <a href="https://www.instagram.com/vasaroskampelis/" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center h-5 font-semibold">
                  vasaroskampelis
                </a>
              </li>
              <li className="flex items-center gap-3 py-1">
                <img src="https://cdn.simpleicons.org/tiktok/FFFFFF" alt="TikTok" className="w-5 h-5 block shrink-0" loading="lazy" decoding="async" />
                <a href="https://www.tiktok.com/@vasaroskampelis" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center h-5 font-semibold">
                  vasaroskampelis
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-3 pb-6 text-center text-sm text-white/80">
          {/* Payment processor logos only */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-5">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
              alt="Mastercard"
              className="h-5 object-contain opacity-90"
              width={32}
              height={20}
              loading="lazy"
            />
            <div className="bg-white/10 border border-white/20 px-2 py-1 rounded">
              <span className="text-white font-bold text-xs">VISA</span>
            </div>
            <img
              src="/stripe-logo.svg"
              alt="Stripe"
              className="h-5 object-contain opacity-90"
              width={60}
              height={20}
              loading="lazy"
            />
          </div>
          <p className="text-xs text-white/80">© 2026 Vasaros Kampelis. Visos teisės saugomos.</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-white/80">
            <Lock className="w-4 h-4" aria-hidden />
            <span className="text-xs font-semibold">SSL Secure Checkout | 256-bit Encryption</span>
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
          <div className={`fixed right-0 top-0 w-full max-w-md bg-white shadow-xl overflow-y-auto ${totalItems === 0 ? 'h-auto max-h-full' : 'h-full'}`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Krepšelis • {totalItems}</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Gift Progress */}
              {totalItems > 0 && (
                <div className="bg-brand-bg-alt p-4 rounded-lg mb-6">
                  <p className="text-sm font-medium mb-2">Jūs esate €{(isFreeShipping ? 0 : Math.max(0, 80 - totalPrice)).toFixed(2)} nuo NEMOKAMO siuntimo!</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-brand-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${isFreeShipping ? 100 : Math.min(100, (totalPrice / 80) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-brand-orange" />
                      <span className="text-xs text-gray-600">Nemokamas pristatymas</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Urgency in Cart - Only show when cart has items */}
              {totalItems > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-2 text-orange-800">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-sm">Pasiūlymas baigiasi:</span>
                    <span className="font-bold">
                      {urgencyTimer.hours}:{urgencyTimer.minutes.toString().padStart(2, '0')}:{urgencyTimer.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              {totalItems === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">{t.emptyCart}</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {t.continueShopping}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={`${item.name} - Krepšelyje`}
                        className="w-20 h-20 object-cover rounded"
                        loading="lazy"
                        decoding="async"
                        width="80"
                        height="80"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-base">{item.name}</h3>
                        {item.selectedColor && (
                          <p className="text-sm font-semibold text-gray-700">Spalva: {item.selectedColor}</p>
                        )}
                        {item.selectedSize && (
                          <p className="text-sm font-semibold text-gray-700">{item.sizeLabel || 'Dydis'}: {item.selectedSize}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xl font-extrabold text-brand-orange">€{Number(item.price).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-sm hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-sm hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-brand-orange"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Button */}
              {totalItems > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{t.orderTotal}:</span>
                      <span className="text-xl font-bold text-brand-orange">€{totalPrice.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => {
                        try {
                          const w: any = (typeof window !== 'undefined') ? window : null;
                          if (w && typeof w.fbq === 'function') {
                            w.fbq('track', 'InitiateCheckout', {
                              value: Number(totalPrice.toFixed(2)),
                              currency: 'EUR',
                              num_items: totalItems,
                            });
                          }
                        } catch {}
                        setCheckoutOpen(true);
                      }}
                      className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-3 rounded-lg font-semibold transition min-h-[48px]"
                    >
                      {t.checkout} • €{totalPrice.toFixed(2)}
                    </button>
                  </div>

                  {/* Payment Logos */}
                  <div className="flex justify-center space-x-3 pt-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                      className="h-6 opacity-60"
                      alt="Mastercard"
                    />
                    <div className="bg-white border border-gray-300 px-2 py-1 rounded">
                      <span className="text-blue-600 font-bold text-sm">VISA</span>
                    </div>
                    <img
                      src="/stripe-logo.svg"
                      className="h-6 opacity-80"
                      alt="Stripe"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* SSL Secure */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>SSL Secure Checkout | 256-bit Encryption</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
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
                  onClick={() => setCheckoutOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
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
                  <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4 max-h-56 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm sm:text-base line-clamp-1">{item.name}</h4>
                          <p className="text-xs sm:text-sm font-semibold text-gray-700">Kiekis: {item.quantity}</p>
                          {item.selectedColor && (
                            <p className="text-xs text-gray-600 font-semibold">Spalva: {item.selectedColor}</p>
                          )}
                          {item.selectedSize && (
                            <p className="text-xs text-gray-600 font-semibold">Šautuvo tipas: {(item.selectedSize as string).split(', ')[0] || item.selectedSize}</p>
                          )}
                          <p className="font-bold text-red-600 text-sm sm:text-base">€{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
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

                  {/* Payment Logos */}
                  <div className="flex justify-center space-x-3 mb-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                      className="h-6 opacity-60"
                      alt="Mastercard"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="bg-white border border-gray-300 px-2 py-1 rounded">
                      <span className="text-blue-600 font-bold text-sm">VISA</span>
                    </div>
                    <img
                      src="/stripe-logo.svg"
                      className="h-6 opacity-80"
                      alt="Stripe"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* SSL Security Badge */}
                  <div className="flex items-center justify-center space-x-2 mb-4 bg-gray-100 rounded-lg py-2">
                    <Lock className="w-4 h-4 text-brand-green" />
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
        <Route path="/blog/kaip-issirinkti-vandens-blasteri" element={<BlogPostKaipIssirinktiBlasteri />} />
        <Route path="/blog/pikniko-idejos-vasarai" element={<BlogPostPiknikoIdejos />} />
        <Route path="/pristatymo-info" element={<PristatymoInfo />} />
        <Route path="/grazinimai" element={<Grazinimai />} />
        <Route path="/kontaktai" element={<Kontaktai />} />
        <Route path="/privatumo-politika" element={<PrivatumoPolitika />} />
        <Route path="/slapuku-politika" element={<SlapukuPolitika />} />
      </Routes>
    </Suspense>
  );
}

