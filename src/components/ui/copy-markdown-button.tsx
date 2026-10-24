"use client";

import { useRef, useState } from "react";

type State = "idle" | "copying" | "copied" | "error";

const labels: Record<State, string> = {
  idle: "Copy as Markdown",
  copying: "Copying…",
  copied: "Copied",
  error: "Copy blocked: use View Markdown",
};

/** Last resort for browsers without async clipboard access; must run inside the click. */
function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

/**
 * Copies the chapter as clean Markdown (ideal for pasting into an LLM). The text is fetched
 * when the pointer or focus reaches the button, so pages don't carry a second copy of the
 * chapter and the click itself can copy synchronously.
 */
export function CopyMarkdownButton({ href }: { href: string }) {
  const [state, setState] = useState<State>("idle");
  const cache = useRef<string | null>(null);
  const pending = useRef<Promise<string> | null>(null);

  function load(): Promise<string> {
    pending.current ??= fetch(href)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((text) => (cache.current = text))
      .catch((error: unknown) => {
        pending.current = null;
        throw error;
      });
    return pending.current;
  }

  async function copy() {
    setState("copying");
    try {
      const text = cache.current;
      if (text !== null) {
        await navigator.clipboard.writeText(text).catch(() => {
          if (!legacyCopy(text)) throw new Error("clipboard unavailable");
        });
      } else if (typeof ClipboardItem !== "undefined") {
        // A promise-valued ClipboardItem keeps the user gesture alive in Safari while we fetch.
        const blob = load().then((t) => new Blob([t], { type: "text/plain" }));
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
      } else {
        await navigator.clipboard.writeText(await load());
      }
      setState("copied");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  const prefetch = () => void load().catch(() => {});

  return (
    <button
      type="button"
      className="chapter-action"
      onClick={copy}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      disabled={state === "copying"}
      data-state={state}
    >
      <span aria-live="polite">{labels[state]}</span>
    </button>
  );
}
