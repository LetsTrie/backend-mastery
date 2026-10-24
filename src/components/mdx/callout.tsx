import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icons";
import { CALLOUT_LABELS as labels, isCalloutType, type CalloutType } from "@/lib/content/catalog";

const icons: Record<CalloutType, IconName> = {
  note: "note",
  tip: "tip",
  warning: "warning",
  pitfall: "pitfall",
  interview: "interview",
};

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
      <span className="callout-icon" aria-hidden="true">
        <Icon name={icons[kind]} size={17} />
      </span>
      <p className="callout-title">{title ?? labels[kind]}</p>
      <div className="callout-body">{children}</div>
    </div>
  );
}
