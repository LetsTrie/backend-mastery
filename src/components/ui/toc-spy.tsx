"use client";

import { useEffect } from "react";

/** Marks the TOC link of the section currently being read with aria-current. */
export function TocSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const visible = new Set<string>();
    const mark = (id: string) => {
      document.querySelectorAll<HTMLAnchorElement>(".toc-rail [data-toc-id]").forEach((link) => {
        if (link.dataset.tocId === id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = headings.find((h) => visible.has(h.id));
        if (current) mark(current.id);
      },
      { rootMargin: "-64px 0px -70% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [ids]);

  return null;
}
