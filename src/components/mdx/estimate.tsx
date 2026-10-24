import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/** Back-of-the-envelope table: Quantity | Formula | Result. Assumptions go in the prose above. */
export function Estimate({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="estimate" role="group" aria-label={title ? `Estimate: ${title}` : "Estimate"}>
      <p className="estimate-title">
        <Icon name="estimate" size={16} />
        <span className="table-kind">Estimate</span>
        {title ? <span>{title}</span> : null}
      </p>
      {children}
    </div>
  );
}
