"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

interface SlideImage {
  id: string;
  url: string;
  alt: string;
}

export default function GallerySlideshow({ images }: { images: SlideImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % images.length) + images.length) % images.length;
      setCurrentIndex(next);
      setLoadedImages((prev) => {
        const nextSet = new Set(prev);
        nextSet.add(next);
        if (next > 0) nextSet.add(next - 1);
        if (next < images.length - 1) nextSet.add(next + 1);
        return nextSet;
      });
    },
    [images.length]
  );

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--color-secondary)] text-editorial-sm">
        No images
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      <div
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {loadedImages.has(i) && (
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-contain p-4 md:p-8"
                sizes="100vw"
                priority={i <= 1}
                loading={i <= 1 ? "eager" : "lazy"}
              />
            )}
          </div>
        ))}
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-8 flex items-end justify-between">
        {/* Prev / Next */}
        <div className="flex gap-6">
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="text-[13px] tracking-[0.1em] uppercase font-semibold hover:opacity-60 transition-opacity min-w-[44px] min-h-[44px] flex items-center"
          >
            Prev
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="text-[13px] tracking-[0.1em] uppercase font-semibold hover:opacity-60 transition-opacity min-w-[44px] min-h-[44px] flex items-center"
          >
            Next
          </button>
        </div>

        {/* Counter */}
        <div className="text-[13px] tracking-[0.1em] text-[var(--color-secondary)]">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnail toggle */}
        <button
          onClick={() => setShowThumbnails(!showThumbnails)}
          className="text-[13px] tracking-[0.1em] uppercase font-semibold hover:opacity-60 transition-opacity min-w-[44px] min-h-[44px] flex items-center"
        >
          {showThumbnails ? "Hide" : "Thumbnails"}
        </button>
      </div>

      {/* Click zones */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-0 top-0 w-1/4 h-3/4 z-10 cursor-pointer"
        tabIndex={-1}
      />
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-0 top-0 w-1/4 h-3/4 z-10 cursor-pointer"
        tabIndex={-1}
      />

      {/* Thumbnail strip */}
      {showThumbnails && (
        <div className="absolute inset-x-0 bottom-20 z-30 bg-[var(--color-background)] border-t border-[var(--color-border)] p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => goTo(i)}
                className={`shrink-0 w-16 h-16 overflow-hidden border ${
                  i === currentIndex
                    ? "border-[var(--color-primary)] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                } transition-opacity`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
