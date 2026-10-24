"use client";

import { useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";
const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();
const order: Theme[] = ["system", "light", "dark"];
const labels: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Cycles Auto → Light → Dark. The pre-paint script in the root layout applies the choice. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  function cycle() {
    const next = order[(order.indexOf(theme) + 1) % order.length] ?? "system";
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page view only.
    }
    if (next === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    listeners.forEach((listener) => listener());
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-sm border border-border px-2.5 py-1 text-xs whitespace-nowrap text-muted hover:text-text"
      aria-label={`Color theme: ${labels[theme]}. Activate to change.`}
    >
      {labels[theme]}
    </button>
  );
}

/** Runs before first paint so there is no flash of the wrong theme. */
export const themeScript = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
