import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

/**
 * `## Retries and backoff [#retry-with-backoff]` — an explicit, permanent anchor.
 * (Not `{#id}`: in MDX, braces are JavaScript expressions.)
 */
const explicitId = /\s*\[#([a-z0-9]+(?:-[a-z0-9]+)*)\]\s*$/;

/** Removes `count` characters from the end of a heading's trailing text nodes. */
function trimTrailingText(node: Heading, count: number) {
  let remaining = count;
  while (remaining > 0) {
    const last = node.children.at(-1);
    if (last?.type !== "text") return;
    if (last.value.length <= remaining) {
      remaining -= last.value.length;
      node.children.pop();
    } else {
      last.value = last.value.slice(0, -remaining);
      remaining = 0;
    }
  }
}

export type TocItem = { depth: 2 | 3; id: string; text: string };
export type HeadingInfo = { depth: number; id: string; text: string; line?: number };

/**
 * Assigns stable ids to every heading and strips `[#id]` suffixes from the text.
 * The single source of heading ids: used by both the MDX compiler and the analyzer,
 * so the TOC, anchors, and content lint always agree.
 */
export function assignHeadingIds(tree: Root): HeadingInfo[] {
  const slugger = new GithubSlugger();
  const headings: HeadingInfo[] = [];

  visit(tree, "heading", (node: Heading) => {
    let id: string | undefined;
    const match = explicitId.exec(toString(node));
    if (match) {
      id = match[1];
      trimTrailingText(node, match[0].length);
    }
    const text = toString(node).trim();
    if (id) slugger.slug(id); // reserve it so a later implicit slug can't collide
    else id = slugger.slug(text);

    // `hProperties` is read by mdast-util-to-hast when the heading becomes an <hN>.
    const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
    data.hProperties = { ...data.hProperties, id };
    headings.push({ depth: node.depth, id, text, line: node.position?.start.line });
  });

  return headings;
}

/** Remark plugin wrapper around {@link assignHeadingIds}. */
export function remarkHeadingIds() {
  return (tree: Root) => {
    assignHeadingIds(tree);
  };
}
