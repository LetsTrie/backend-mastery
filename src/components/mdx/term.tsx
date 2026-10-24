import { useId, type ReactNode } from "react";
import type { GlossaryEntry } from "@/lib/content";

/** Glossary link with a hover/focus definition. Use on the first occurrence per chapter. */
export function Term({ entry, children }: { entry: GlossaryEntry | undefined; children: ReactNode }) {
  const tipId = useId();
  if (!entry) return <>{children}</>;
  return (
    <span className="term">
      <a href={`/glossary#${entry.id}`} aria-describedby={tipId}>
        {children}
      </a>
      <span role="tooltip" id={tipId} className="term-tip">
        <strong>{entry.term}.</strong> {entry.definition}
      </span>
    </span>
  );
}
