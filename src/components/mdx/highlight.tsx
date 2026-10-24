import type { ReactNode } from "react";

/**
 * A key phrase the reader must not miss: bold with a solid accent underline. Distinct from
 * links (accent text) and glossary terms (dotted underline). Use sparingly, a few per chapter.
 */
export function Highlight({ children }: { children: ReactNode }) {
  return <strong className="highlight">{children}</strong>;
}
