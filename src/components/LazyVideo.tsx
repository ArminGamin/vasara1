import React, { useRef, useState, useEffect } from 'react';

/** Loads video src only when in viewport – saves ~28MB on initial load */
export function LazyVideo({
  src,
  className,
  playsInline,
  muted,
  loop,
  autoPlay,
  controls,
  'aria-label': ariaLabel,
}: React.ComponentProps<'video'>) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: '200px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      className={className}
      playsInline={playsInline}
      muted={muted}
      loop={loop}
      autoPlay={autoPlay}
      preload={shouldLoad ? 'auto' : 'none'}
      controls={controls}
      aria-label={ariaLabel}
    />
  );
}
