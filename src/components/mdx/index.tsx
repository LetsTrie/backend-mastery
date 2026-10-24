/**
 * The MDX component catalog — the public API between writers and the site.
 * Contract: .claude/rules/mdx-components.md. Never remove or rename a component or prop.
 */
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { getGlossaryEntry, type Chapter } from "@/lib/content";
import { Aside } from "./aside";
import { Callout } from "./callout";
import { Cite } from "./cite";
import { CodeBlock } from "./code-block";
import { Anchor, H2, H3, H4, Table } from "./elements";
import { Estimate } from "./estimate";
import { FigRef, Figure } from "./figure";
import { Highlight } from "./highlight";
import { KeyTakeaways } from "./key-takeaways";
import { Steps } from "./steps";
import { Tab, Tabs } from "./tabs";
import { Term } from "./term";
import { Tradeoffs } from "./tradeoffs";

/** Components bound to one chapter, so figure numbers and citations resolve from build-time data. */
export function getMdxComponents(chapter: Chapter): MDXComponents {
  const figure = (id: string) => chapter.figures.find((f) => f.id === id);

  return {
    h2: H2,
    h3: H3,
    h4: H4,
    a: Anchor,
    table: Table,
    pre: CodeBlock,

    KeyTakeaways,
    Callout,
    Estimate,
    Tradeoffs,
    Steps,
    Aside,
    Highlight,
    Tabs,
    Tab,
    Figure: ({ id }: { id: string }) => <Figure figure={figure(id)} />,
    FigRef: ({ id }: { id: string }) => <FigRef id={id} figure={figure(id)} />,
    Cite: ({ href }: { href: string }) => (
      <Cite citation={chapter.citations.find((c) => c.href === href)} />
    ),
    Term: ({ id, children }: { id: string; children: ReactNode }) => (
      <Term entry={getGlossaryEntry(id)}>{children}</Term>
    ),
  };
}
