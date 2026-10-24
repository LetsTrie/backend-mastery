import { useId, type ReactNode } from "react";
import type { GlossaryEntry } from "@/lib/content";

/**
 * A glossary term with an in-place definition (a toggletip). Hover or keyboard focus shows
 * it; a click or tap toggles it (wired once per page by <TermTips />). It never navigates.
 * Use on the first occurrence per `##` section.
 */
export function Term({ entry, children }: { entry: GlossaryEntry | undefined; children: ReactNode }) {
  const tipId = useId();
  if (!entry) return <>{children}</>;
  return (
    <span className="term">
      {/* A span, not a <button>: buttons cannot wrap across lines inside running text. */}
      <span
        role="button"
        tabIndex={0}
        className="term-trigger"
        aria-describedby={tipId}
        aria-expanded={false}
      >
        {children}
      </span>
      <span role="tooltip" id={tipId} className="term-tip">
        <strong>{entry.term}.</strong> {entry.definition}
      </span>
    </span>
  );
}
