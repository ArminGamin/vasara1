import React from 'react';

/** Main UGC video – file lives in public/upscaled-video.mp4 */
const UGC_VIDEO_SRC = '/upscaled-video.mp4';

export function UGCSection() {
  return (
    <section className="py-12 sm:py-16 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-h2 sm:text-h2-lg font-bold text-text text-center mb-2">
          Kaip žaidžia mūsų klientai
        </h2>
        <p className="text-center text-muted mb-10 max-w-xl mx-auto">
          Tikros nuotraukos ir vaizdo įrašai – šeimos ir draugai vasarą.
        </p>
      </div>
      {/* Video full-bleed for maximum size */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
          <video
            src={UGC_VIDEO_SRC}
            controls
            className="w-full aspect-video object-contain"
            playsInline
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
