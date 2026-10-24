"use client";

import { lazy, Suspense, useEffect, useState } from "react";

export type GallerySlide = {
  id: string;
  src: string;
  darkSrc: string | null;
  width: number;
  height: number;
  alt: string;
  title: string;
  description: string;
};

// The lightbox library and its styles load on first open, so pages pay nothing until then.
const FigureLightbox = lazy(() => import("./figure-lightbox"));

function prefersDark() {
  const theme = document.documentElement.dataset.theme;
  if (theme) return theme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Opens chapter figures in a gallery (zoom, pan, fullscreen, previous/next) instead of
 * navigating to the SVG. Figures stay plain links, so without JavaScript, or with a modifier
 * key or middle click, the full-size SVG still opens in the browser.
 */
export function FigureGallery({ slides }: { slides: GallerySlide[] }) {
  const [index, setIndex] = useState(-1);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest?.(".figure-img");
      const figure = link?.closest("figure[id^='fig-']");
      if (!figure) return;
      const at = slides.findIndex((slide) => `fig-${slide.id}` === figure.id);
      if (at < 0) return;
      event.preventDefault();
      setDark(prefersDark());
      setIndex(at);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slides]);

  if (index < 0) return null;
  return (
    <Suspense fallback={null}>
      <FigureLightbox slides={slides} index={index} dark={dark} onClose={() => setIndex(-1)} />
    </Suspense>
  );
}
