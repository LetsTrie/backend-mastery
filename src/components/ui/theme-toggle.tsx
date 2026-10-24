"use client";

import { useSyncExternalStore } from "react";
import { Icon, type IconName } from "./icons";
import { THEME_STORAGE_KEY } from "./pre-paint";

type Theme = "system" | "light" | "dark";
const STORAGE_KEY = THEME_STORAGE_KEY;
const listeners = new Set<() => void>();
const order: Theme[] = ["system", "light", "dark"];
const labels: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };
const icons: Record<Theme, IconName> = { system: "monitor", light: "sun", dark: "moon" };

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

  const next = order[(order.indexOf(theme) + 1) % order.length] ?? "system";

  return (
    <button
      type="button"
      onClick={cycle}
      className="icon-button"
      aria-label={`Color theme: ${labels[theme]}. Switch to ${labels[next]}.`}
      title={`Theme: ${labels[theme]}`}
    >
      <Icon name={icons[theme]} size={18} />
    </button>
  );
}
