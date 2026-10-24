"use client";

import { useEffect } from "react";

const EDGE = 12; // px kept clear of the viewport edges
const SMALL_SCREEN = "(max-width: 40rem)"; // tips become a bottom card; see article.css

/**
 * Wires every <Term> on the page with one set of listeners: click/tap and Enter/Space toggle
 * a tip, a click elsewhere or Escape closes it, and a shown tip is nudged to stay on screen.
 * Hover and keyboard focus are pure CSS, so tips still work on desktop without JavaScript.
 */
export function TermTips() {
  useEffect(() => {
    let open: HTMLElement | null = null;

    function place(term: HTMLElement) {
      const tip = term.querySelector<HTMLElement>(".term-tip");
      if (!tip) return;
      tip.style.removeProperty("--tip-shift");
      delete tip.dataset.place;
      if (window.matchMedia(SMALL_SCREEN).matches) return;
      const rect = tip.getBoundingClientRect();
      let shift = 0;
      if (rect.right > window.innerWidth - EDGE) shift = window.innerWidth - EDGE - rect.right;
      if (rect.left + shift < EDGE) shift = EDGE - rect.left;
      if (shift) tip.style.setProperty("--tip-shift", `${Math.round(shift)}px`);
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      if (rect.top < headerBottom + EDGE) tip.dataset.place = "below";
    }

    function setOpen(term: HTMLElement | null) {
      if (open && open !== term) {
        open.removeAttribute("data-open");
        open.querySelector(".term-trigger")?.setAttribute("aria-expanded", "false");
      }
      open = term;
      if (term) {
        term.setAttribute("data-open", "");
        term.querySelector(".term-trigger")?.setAttribute("aria-expanded", "true");
        place(term);
      }
    }

    function toggle(trigger: Element) {
      const term = trigger.closest<HTMLElement>(".term");
      setOpen(term === open ? null : term);
    }

    function onClick(event: MouseEvent) {
      const target = event.target as Element;
      const trigger = target.closest(".term-trigger");
      if (trigger) toggle(trigger);
      else if (!target.closest(".term-tip")) setOpen(null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(null);
        return;
      }
      const trigger = (event.target as Element).closest?.(".term-trigger");
      if (trigger && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        toggle(trigger);
      }
    }

    // Hover and focus show tips through CSS; position them as they appear.
    function onShow(event: Event) {
      const term = (event.target as Element).closest?.<HTMLElement>(".term");
      if (term) place(term);
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerover", onShow);
    document.addEventListener("focusin", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerover", onShow);
      document.removeEventListener("focusin", onShow);
    };
  }, []);

  return null;
}
