import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/**
 * "Good to know": a collapsed, optional detail the reader can open or skip. Native
 * <details>, so it works without JavaScript; print opens it (see PrintPrep). Never essential.
 */
export function Aside({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <details className="good-to-know">
      <summary>
        <span className="good-to-know-icon" aria-hidden="true">
          <Icon name="tip" size={16} />
        </span>
        <span className="good-to-know-label">Good to know</span>
        {title ? <span className="good-to-know-title">{title}</span> : null}
        <span className="good-to-know-chevron" aria-hidden="true">
          <Icon name="chevronDown" size={16} />
        </span>
      </summary>
      <div className="good-to-know-body">{children}</div>
    </details>
  );
}
