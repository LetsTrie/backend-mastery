import type { ReactNode } from "react";

/** Tangential note, rendered inline as a tinted box. Never essential. */
export function Aside({ children }: { children: ReactNode }) {
  return (
    <div className="margin-note-anchor">
      <aside className="margin-note">{children}</aside>
    </div>
  );
}
