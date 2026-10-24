"use client";

import { useEffect } from "react";

/** Lazy images below the fold may not be loaded yet; a printed page must include every figure. */
function loadAllImages(): Promise<unknown> {
  const images = [...document.querySelectorAll<HTMLImageElement>("article img")];
  for (const image of images) image.loading = "eager";
  const pending = images
    .filter((image) => !image.complete)
    .map((image) => new Promise((resolve) => image.addEventListener("load", resolve, { once: true })));
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
  return Promise.race([Promise.all(pending), timeout]);
}

/** Opens the browser's print dialog ("Save as PDF" lives there) with print-optimized styles. */
export function PrintButton() {
  useEffect(() => {
    // Also cover Ctrl/Cmd+P, which bypasses the button.
    const onBeforePrint = () => void loadAllImages();
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []);

  async function print() {
    await loadAllImages();
    window.print();
  }

  return (
    <button type="button" className="chapter-action" onClick={print}>
      Print or save as PDF
    </button>
  );
}
