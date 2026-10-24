import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/** Opening summary box: 3–5 full-sentence bullets. Renders the permanent `#key-takeaways` anchor. */
export function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <section className="key-takeaways" aria-labelledby="key-takeaways">
      <h2 id="key-takeaways">
        <Icon name="list" size={16} />
        Key takeaways
      </h2>
      {children}
    </section>
  );
}
