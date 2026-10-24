/**
 * The MDX component catalog as data — shared by the site, the content lint, and the
 * Markdown export so they can never disagree. Contract: .claude/rules/mdx-components.md.
 */
export const MDX_COMPONENTS = [
  "KeyTakeaways",
  "Figure",
  "FigRef",
  "Callout",
  "Estimate",
  "Tradeoffs",
  "Term",
  "Cite",
  "Steps",
  "Tabs",
  "Tab",
  "Aside",
  "Highlight",
] as const;

export type MdxComponentName = (typeof MDX_COMPONENTS)[number];

export const CALLOUT_LABELS = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  pitfall: "Pitfall",
  interview: "In the interview",
} as const;

export type CalloutType = keyof typeof CALLOUT_LABELS;

export function isCalloutType(value: unknown): value is CalloutType {
  return typeof value === "string" && value in CALLOUT_LABELS;
}
