import type { ReactNode } from "react";

/** Tangential note: in the right margin on wide screens, inline otherwise. Never essential. */
export function Aside({ children }: { children: ReactNode }) {
  return (
    <div className="margin-note-anchor">
      <aside className="margin-note">{children}</aside>
    </div>
  );
}
