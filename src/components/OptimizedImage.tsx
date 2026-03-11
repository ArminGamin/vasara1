import React, { useMemo, useState, useCallback } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
  sizes?: string;
  srcSet?: string;
  fetchPriority?: "high" | "low" | "auto";
  onClick?: () => void;
};

const PLACEHOLDER_IMAGE = "/placeholder.svg";

function productSrcSet(path: string): string | undefined {
  if (!path || path.startsWith("http") || !/\.webp$/i.test(path)) return undefined;
  const b = path.replace(/\.webp$/i, "");
  return `${b}-306w.webp 306w, ${b}-612w.webp 612w, ${path} 1024w`;
}

// Renders a <picture> with AVIF/WebP where safely supported.
// On load error, falls back to placeholder image to avoid broken icon.
const OptimizedImage = React.memo(function OptimizedImage({ src, alt, className, width, height, loading = "lazy", decoding = "async", sizes, srcSet, fetchPriority, onClick }: Props) {
  const [fallback, setFallback] = useState(false);
  const effectiveSrc = fallback ? PLACEHOLDER_IMAGE : src;
  const handleError = useCallback(() => setFallback(true), []);
  const fpAttr = fetchPriority ? { fetchpriority: fetchPriority as any } : {};
  const isUnsplash = /images\.unsplash\.com/.test(src);
  const isLocalProduct = /^\/products\/.+\.(png|jpe?g)$/i.test(src);
  const effectiveSrcSet = srcSet ?? productSrcSet(src);

  if (isUnsplash) {
    const url = new URL(src);
    const baseParams = url.search ? `${url.search}&` : "?";
    const avifSrc = `${url.origin}${url.pathname}${baseParams}fm=avif`;
    const webpSrc = `${url.origin}${url.pathname}${baseParams}fm=webp`;
    if (fallback) {
      return <img src={PLACEHOLDER_IMAGE} alt={alt} className={className} width={width as any} height={height as any} loading={loading} decoding={decoding} onClick={onClick} />;
    }
    return (
      <picture>
        <source srcSet={avifSrc} type="image/avif" />
        <source srcSet={webpSrc} type="image/webp" />
        <img src={src} alt={alt} className={className} width={width as any} height={height as any} loading={loading} decoding={decoding} sizes={sizes} srcSet={effectiveSrcSet} onError={handleError} {...fpAttr} onClick={onClick} />
      </picture>
    );
  }

  if (isLocalProduct) {
    const base = src.replace(/\.(png|jpe?g)$/i, "");
    const sourceChain = useMemo(() => [`${base}.avif`, `${base}.webp`, src], [base, src]);
    const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

    const handleLocalError = useCallback(() => {
      setCurrentSrcIndex((i) => {
        if (i < sourceChain.length - 1) return i + 1;
        setFallback(true);
        return i;
      });
    }, [sourceChain.length]);

    if (fallback) {
      return <img src={PLACEHOLDER_IMAGE} alt={alt} className={className} width={width as any} height={height as any} loading={loading} decoding={decoding} sizes={sizes} onClick={onClick} />;
    }
    return (
      <img
        src={sourceChain[currentSrcIndex]}
        alt={alt}
        className={className}
        width={width as any}
        height={height as any}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        srcSet={effectiveSrcSet}
        {...fpAttr}
        onError={handleLocalError}
        onClick={onClick}
      />
    );
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      width={width as any}
      height={height as any}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      srcSet={effectiveSrcSet}
      {...fpAttr}
      onError={handleError}
      onClick={onClick}
    />
  );
});

export default OptimizedImage;
