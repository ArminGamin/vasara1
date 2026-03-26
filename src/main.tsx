// @ts-nocheck
import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles.css";
import "./design-revolution.css";

// Defer Analytics to reduce main-thread work (index.html loads GA/Meta via requestIdleCallback)
const Analytics = lazy(() => import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })));

// Register service worker for caching (incl. Stripe scripts – extends short CDN cache)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

// Updates <link rel="canonical"> on every route change so Google
// doesn't treat all pages as duplicates of the homepage.
function CanonicalUpdater() {
  const location = useLocation();

  useEffect(() => {
    const BASE = 'https://vasaroskampelis.com';
    // Normalize: strip trailing slash except for root
    const path = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '');
    const canonical = `${BASE}${path}`;

    let tag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!tag) {
      tag = document.createElement('link');
      tag.setAttribute('rel', 'canonical');
      document.head.appendChild(tag);
    }
    tag.setAttribute('href', canonical);
  }, [location.pathname]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CanonicalUpdater />
      <App />
    </BrowserRouter>
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  </React.StrictMode>
);
