import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Remove data: preload links (bad for performance - Vite injects these after transform, so we use closeBundle)
import fs from 'fs';
import path from 'path';

// Inline loader: run after first paint so LCP (static hero) isn't blocked by main bundle
function getDeferLoaderScript(mainSrc) {
  return `(function(s){var d=document,el=d.createElement('script');el.type='module';el.src=s;if('requestIdleCallback' in window)requestIdleCallback(function(){d.body.appendChild(el);},{timeout:400});else setTimeout(function(){d.body.appendChild(el);},100);})("${mainSrc.replace(/"/g, '\\"')}");`;
}

function removeDataPreloadAndPreloadMain() {
  return {
    name: 'remove-data-preload-and-preload-main',
    closeBundle() {
      const indexPath = path.join(process.cwd(), 'dist', 'index.html');
      if (!fs.existsSync(indexPath)) return;
      let html = fs.readFileSync(indexPath, 'utf8');

      // 1. Remove data: preload (bad for performance)
      html = html.replace(/<link[^>]*rel="preload"[^>]*href="data:[^"]*"[^>]*\/?>\s*/gi, '');

      // 2. Make main CSS non-blocking: media="print" onload="this.media='all'" defers render-block
      html = html.replace(
        /<link([^>]*)\srel="stylesheet"([^>]*)\shref="(\/assets\/[^"]+\.css)"([^>]*)\/?>/gi,
        (_, before, mid, href, after) =>
          `<link${before} rel="stylesheet"${mid} href="${href}" media="print" onload="this.media='all'"${after}>`
      );

      // 3. Defer main script: load after first paint so static hero (LCP) isn't blocked by 92 KiB JS
      const mainScriptMatch = html.match(/<script[^>]*\ssrc="(\/assets\/index-[^"]+\.js)"[^>]*>/i);
      if (mainScriptMatch) {
        const mainSrc = mainScriptMatch[1];
        const loader = '<script>' + getDeferLoaderScript(mainSrc) + '</script>';
        html = html.replace(
          /<script[^>]*\ssrc="\/assets\/index-[^"]+\.js"[^>]*><\/script>/i,
          loader
        );
        console.log('[build] Main script deferred until after idle');
      }

      fs.writeFileSync(indexPath, html);
    },
  };
}

export default defineConfig({
  plugins: [react(), removeDataPreloadAndPreloadMain()],
  base: "/",
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    // Let Vite handle chunking to preserve correct load order in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          stripe: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          motion: ['framer-motion'],
          lucide: ['lucide-react'],
          router: ['react-router-dom']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Copy service worker to dist
    copyPublicDir: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk sizes
    chunkSizeWarningLimit: 600,
    // Reduce asset inline limit to force separate files
    assetsInlineLimit: 4096
  },
  publicDir: 'public'
});
