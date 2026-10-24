"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./icons";
import { TOC_STORAGE_KEY } from "./pre-paint";

const STORAGE_KEY = TOC_STORAGE_KEY;
const listeners = new Set<() => void>();

function readCollapsed() {
  return document.documentElement.dataset.toc === "collapsed";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Collapses or expands the chapter's left sidebar; the choice persists across pages. */
export function TocToggle({ controls }: { controls: string }) {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  function toggle() {
    const next = !collapsed;
    if (next) document.documentElement.dataset.toc = "collapsed";
    else delete document.documentElement.dataset.toc;
    try {
      if (next) localStorage.setItem(STORAGE_KEY, "collapsed");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page view only.
    }
    listeners.forEach((listener) => listener());
  }

  const label = collapsed ? "Show table of contents" : "Hide table of contents";
  return (
    <button
      type="button"
      className="icon-button toc-toggle"
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-controls={controls}
      aria-label={label}
      title={label}
    >
      <Icon name="sidebar" size={17} />
    </button>
  );
}
