import type { ReactNode } from "react";

/** Decision record table: Decision | Chosen | Alternative | Why. */
export function Tradeoffs({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="tradeoffs" role="group" aria-label={title ?? "Trade-offs"}>
      <p className="tradeoffs-title">{title ?? "Trade-offs"}</p>
      {children}
    </div>
  );
}
