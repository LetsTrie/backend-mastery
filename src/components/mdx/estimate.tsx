import type { ReactNode } from "react";

/** Back-of-the-envelope table: Quantity | Formula | Result. Assumptions go in the prose above. */
export function Estimate({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="estimate" role="group" aria-label={title ? `Estimate: ${title}` : "Estimate"}>
      {title ? <p className="estimate-title">Estimate · {title}</p> : null}
      {children}
    </div>
  );
}
