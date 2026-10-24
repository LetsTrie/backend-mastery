"use client";

import { useEffect } from "react";

/**
 * Marks the TOC link of the section being read with aria-current: the last heading whose
 * top has scrolled past the reading line just below the sticky header.
 */
export function TocSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const links = document.querySelectorAll<HTMLAnchorElement>(".toc-rail [data-toc-id]");
    let frame = 0;
    let current = "";

    const update = () => {
      frame = 0;
      const line = 120; // px below the viewport top: header height plus breathing room
      let active = headings[0]?.id ?? "";
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - line <= 0) active = heading.id;
        else break;
      }
      // At the very bottom, the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = headings.at(-1)?.id ?? active;
      }
      if (active === current) return;
      current = active;
      links.forEach((link) => {
        if (link.dataset.tocId === active) {
          link.setAttribute("aria-current", "true");
          // Keep the active entry visible inside the rail without moving the page.
          const rail = link.closest<HTMLElement>(".toc-rail");
          if (rail) {
            const top = link.offsetTop - rail.offsetTop;
            if (top < rail.scrollTop + 48 || top > rail.scrollTop + rail.clientHeight - 96) {
              rail.scrollTo({ top: top - rail.clientHeight / 3 });
            }
          }
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return null;
}
