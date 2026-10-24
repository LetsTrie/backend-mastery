import type { ReactNode } from "react";

/** Numbered walkthrough whose numbers match the ①②③ edge labels in the related figure. */
export function Steps({ children }: { children: ReactNode }) {
  return <div className="steps">{children}</div>;
}
