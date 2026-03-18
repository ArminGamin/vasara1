import React, { useRef, useState, useEffect } from 'react';

/** Loads video src when in viewport (or immediately if priority). Uses preload="auto" for faster first frame. */
export function LazyVideo({
  src,
  className,
  playsInline,
  muted,
  loop,
  autoPlay,
  controls,
  'aria-label': ariaLabel,
  priority = false,
}: React.ComponentProps<'video'> & { priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (priority) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: '800px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority]);

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
      {...(priority && shouldLoad ? { fetchPriority: 'high' as const } : {})}
    />
  );
}
