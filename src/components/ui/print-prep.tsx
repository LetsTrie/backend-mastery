"use client";

import { useEffect } from "react";

/**
 * Renders nothing. Before the browser prints (Cmd/Ctrl+P), switches lazy figures to eager
 * and opens collapsed "good to know" boxes, so a printed page or saved PDF has everything.
 * Boxes the reader had closed are closed again afterwards.
 */
export function PrintPrep() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      for (const image of document.querySelectorAll<HTMLImageElement>("article img")) {
        image.loading = "eager";
      }
      opened = [...document.querySelectorAll<HTMLDetailsElement>("details.good-to-know:not([open])")];
      for (const details of opened) details.open = true;
    };
    const afterPrint = () => {
      for (const details of opened) details.open = false;
      opened = [];
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);
  return null;
}
