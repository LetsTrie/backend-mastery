"use client";

import { useEffect } from "react";

/**
 * Renders nothing. Before the browser prints (Cmd/Ctrl+P), switches lazy figures to eager
 * so a printed page or saved PDF includes every diagram.
 */
export function PrintPrep() {
  useEffect(() => {
    const loadAllImages = () => {
      for (const image of document.querySelectorAll<HTMLImageElement>("article img")) {
        image.loading = "eager";
      }
    };
    window.addEventListener("beforeprint", loadAllImages);
    return () => window.removeEventListener("beforeprint", loadAllImages);
  }, []);
  return null;
}
