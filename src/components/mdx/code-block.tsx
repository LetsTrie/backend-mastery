import type { ComponentProps } from "react";
import { CopyButton } from "./copy-button";

/** `pre` override: keyboard-scrollable code with a copy button. Highlighting is done at build time. */
export function CodeBlock(props: ComponentProps<"pre">) {
  return (
    <div className="code-block">
      <pre {...props} tabIndex={0} />
      <CopyButton />
    </div>
  );
}
