import type { Citation } from "@/lib/content";

/** Inline citation marker; the References section is generated from all citations. */
export function Cite({ citation }: { citation: Citation | undefined }) {
  if (!citation) return null;
  return (
    <sup className="cite">
      <a href={`#ref-${citation.n}`} aria-label={`Reference ${citation.n}: ${citation.title}`}>
        [{citation.n}]
      </a>
    </sup>
  );
}
