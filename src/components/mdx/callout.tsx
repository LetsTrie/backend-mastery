import type { ReactNode } from "react";

const labels = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  pitfall: "Pitfall",
  interview: "In the interview",
} as const;

export type CalloutType = keyof typeof labels;

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
  const kind: CalloutType = type in labels ? type : "note";
  return (
    <div className="callout" data-type={kind} role="note">
      <p className="callout-title">{title ?? labels[kind]}</p>
      <div className="callout-body">{children}</div>
    </div>
  );
}
