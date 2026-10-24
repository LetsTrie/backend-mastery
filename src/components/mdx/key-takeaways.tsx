import type { ReactNode } from "react";

/** Opening summary box: 3–5 full-sentence bullets. Renders the permanent `#key-takeaways` anchor. */
export function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <section className="key-takeaways" aria-labelledby="key-takeaways">
      <h2 id="key-takeaways">Key takeaways</h2>
      {children}
    </section>
  );
}
