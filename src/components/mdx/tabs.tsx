import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { TabsClient } from "./tabs-client";

type TabProps = { label: string; children: ReactNode };

/** One view inside <Tabs>. Rendered by <Tabs>; never on its own. */
export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

/**
 * Alternative views of the same thing. Without JavaScript every panel is shown in order
 * under its label, so the first tab must make sense on its own.
 */
export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children)
    .filter((child): child is ReactElement<TabProps> => isValidElement(child))
    .map((child) => ({ label: child.props.label, content: child.props.children }));
  return <TabsClient tabs={tabs} />;
}
