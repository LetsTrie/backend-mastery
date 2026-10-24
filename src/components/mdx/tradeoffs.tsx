import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/** Decision record table: Decision | Chosen | Alternative | Why. */
export function Tradeoffs({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="tradeoffs" role="group" aria-label={title ?? "Trade-offs"}>
      <p className="tradeoffs-title">
        <Icon name="tradeoffs" size={16} />
        <span className="table-kind">Trade-offs</span>
        {title ? <span>{title}</span> : null}
      </p>
      {children}
    </div>
  );
}
