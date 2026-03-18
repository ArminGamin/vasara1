// @ts-nocheck
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles.css";
import "./design-revolution.css";

// Defer Analytics & Speed Insights to reduce main-thread work (index.html loads GA/Meta via requestIdleCallback)
const Analytics = lazy(() => import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then((m) => ({ default: m.SpeedInsights })));

// Register service worker for caching (incl. Stripe scripts – extends short CDN cache)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Suspense fallback={null}>
      <Analytics />
      <SpeedInsights />
    </Suspense>
  </React.StrictMode>
);
