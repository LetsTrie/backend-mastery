import type { ReactNode } from "react";
import { CALLOUT_LABELS as labels, isCalloutType, type CalloutType } from "@/lib/content/catalog";

/** Highlighted aside. `interview` = how this topic comes up in a design interview. */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const kind: CalloutType = isCalloutType(type) ? type : "note";
  return (
    <div className="callout" data-type={kind} role="note">
      <p className="callout-title">{title ?? labels[kind]}</p>
      <div className="callout-body">{children}</div>
    </div>
  );
}
