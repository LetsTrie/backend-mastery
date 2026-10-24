"use client";

import { useState, type MouseEvent } from "react";

export function CopyButton() {
  const [copied, setCopied] = useState(false);

  async function copy(event: MouseEvent<HTMLButtonElement>) {
    const code = event.currentTarget.closest(".code-block")?.querySelector("code");
    if (!code) return;
    await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      className="copy-button"
      onClick={copy}
      data-copied={copied || undefined}
      aria-label={copied ? "Copied" : "Copy code to clipboard"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
