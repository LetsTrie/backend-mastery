/**
 * Portable Markdown export of a chapter body: plain CommonMark + GFM (tables, footnotes),
 * no JSX. Used for `/chapters/<slug>.md` and `llms-full.txt`.
 *
 * Every catalog component must have a mapping here (see .claude/rules/mdx-components.md);
 * the unit tests fail if one is missing.
 */
import type { Paragraph, PhrasingContent, Root, RootContent } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { parseMdx, type Citation } from "./analyze";
import { CALLOUT_LABELS, isCalloutType } from "./catalog";
import { assignHeadingIds } from "./headings";

export type MarkdownContext = {
  /** Absolute chapter URL, used to resolve `#anchor` links. */
  chapterUrl: string;
  /** Site origin, used to resolve root-relative links and figure URLs. */
  origin: string;
  figures: { id: string; number: number; url: string; alt: string; caption: string }[];
  citations: Citation[];
};

type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;
type Parent = { children: RootContent[] };

const PHRASING = new Set([
  "text",
  "emphasis",
  "strong",
  "delete",
  "inlineCode",
  "link",
  "image",
  "break",
  "footnoteReference",
]);

const text = (value: string): PhrasingContent => ({ type: "text", value });
const strong = (value: string): PhrasingContent => ({ type: "strong", children: [text(value)] });
const paragraph = (children: PhrasingContent[]): Paragraph => ({ type: "paragraph", children });

function attr(node: JsxElement, name: string): string | undefined {
  const found = node.attributes.find((a) => a.type === "mdxJsxAttribute" && a.name === name);
  return found && typeof found.value === "string" ? found.value : undefined;
}

/** Parses a plain-text prop (e.g. a caption with `inline code`) into phrasing nodes. */
function inlineMarkdown(value: string): PhrasingContent[] {
  const first = unified().use(remarkParse).parse(value).children[0];
  return first?.type === "paragraph" ? first.children : [text(value)];
}

function absolutize(url: string, ctx: MarkdownContext): string {
  if (url.startsWith("#")) return `${ctx.chapterUrl}${url}`;
  if (url.startsWith("/")) return `${ctx.origin}${url}`;
  return url;
}

/** Wraps loose phrasing children (`<Callout>one line</Callout>`) in a paragraph. */
function asBlocks(nodes: RootContent[]): RootContent[] {
  if (nodes.length > 0 && nodes.every((n) => PHRASING.has(n.type))) {
    return [paragraph(nodes as PhrasingContent[])];
  }
  return nodes;
}

/** A blockquote whose first paragraph starts with a bold label: "> **Tip.** …" */
function labelledQuote(label: string, children: RootContent[]): RootContent[] {
  const blocks = asBlocks(children);
  const lead = strong(`${label}.`);
  const first = blocks[0];
  if (first?.type === "paragraph") {
    first.children.unshift(lead, text(" "));
  } else {
    blocks.unshift(paragraph([lead]));
  }
  return [{ type: "blockquote", children: blocks as never }];
}

function convertJsx(node: JsxElement, ctx: MarkdownContext): RootContent[] {
  const children = () => convertAll(node.children as RootContent[], ctx);
  const figure = (id: string | undefined) => ctx.figures.find((f) => f.id === id);

  switch (node.name) {
    case "KeyTakeaways":
      return [{ type: "heading", depth: 2, children: [text("Key takeaways")] }, ...children()];
    case "Figure": {
      const fig = figure(attr(node, "id"));
      if (!fig) return [];
      return [
        paragraph([{ type: "image", url: absolutize(fig.url, ctx), alt: fig.alt }]),
        paragraph([
          { type: "emphasis", children: [text(`Figure ${fig.number}. `), ...inlineMarkdown(fig.caption)] },
        ]),
      ];
    }
    case "FigRef": {
      const fig = figure(attr(node, "id"));
      return fig ? [text(`Figure ${fig.number}`) as RootContent] : [];
    }
    case "Cite": {
      const citation = ctx.citations.find((c) => c.href === attr(node, "href"));
      if (!citation) return [];
      const id = String(citation.n);
      return [{ type: "footnoteReference", identifier: id, label: id }];
    }
    case "Term":
    case "Steps":
    case "Tabs":
      return children();
    case "Tab":
      return [paragraph([strong(attr(node, "label") ?? "")]), ...asBlocks(children())];
    case "Callout": {
      const type = attr(node, "type");
      const label = attr(node, "title") ?? CALLOUT_LABELS[isCalloutType(type) ? type : "note"];
      return labelledQuote(label, children());
    }
    case "Highlight":
      return [{ type: "strong", children: children() as never }];
    case "Aside":
      return labelledQuote(attr(node, "title") ? `Good to know: ${attr(node, "title")}` : "Good to know", children());
    case "Estimate":
      return [paragraph([strong(`Estimate: ${attr(node, "title") ?? "back of the envelope"}`)]), ...children()];
    case "Tradeoffs":
      return [paragraph([strong(attr(node, "title") ?? "Trade-offs")]), ...children()];
    default:
      // Unknown elements (the lint forbids them) degrade to their children.
      return children();
  }
}

function convert(node: RootContent, ctx: MarkdownContext): RootContent[] {
  switch (node.type) {
    case "mdxjsEsm":
    case "mdxFlowExpression":
    case "mdxTextExpression":
      return [];
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      return convertJsx(node, ctx);
    case "link":
    case "image":
      node.url = absolutize(node.url, ctx);
      break;
  }
  if ("children" in node) {
    (node as Parent).children = convertAll((node as Parent).children, ctx);
  }
  return [node];
}

function convertAll(nodes: RootContent[], ctx: MarkdownContext): RootContent[] {
  const out = nodes.flatMap((node) => convert(node, ctx));
  // Attach footnote markers to the preceding word: "rules [^1]" → "rules[^1]".
  out.forEach((node, i) => {
    const previous = out[i - 1];
    if (node.type === "footnoteReference" && previous?.type === "text") {
      previous.value = previous.value.trimEnd();
    }
  });
  return out;
}

/** Footnote definitions for every citation, in order: `[^1]: Author. [Title](url). Year.` */
export function citationDefinitions(citations: Citation[]): RootContent[] {
  return citations.map((c) => ({
    type: "footnoteDefinition",
    identifier: String(c.n),
    label: String(c.n),
    children: [
      paragraph([
        ...(c.author ? [text(`${c.author}. `)] : []),
        { type: "link", url: c.href, children: [text(c.title)] },
        text(c.year ? `. ${c.year}.` : "."),
      ]),
    ],
  }));
}

export function stringifyMarkdown(tree: Root): string {
  return unified()
    .use(remarkGfm)
    .use(remarkStringify, { bullet: "-", emphasis: "*", strong: "*", fences: true, rule: "-" })
    .stringify(tree);
}

/** Converts a chapter's MDX body to portable Markdown nodes (no header, no references). */
export function mdxToMarkdownTree(source: string, ctx: MarkdownContext): RootContent[] {
  const tree = parseMdx(source);
  assignHeadingIds(tree); // strips `[#explicit-id]` suffixes from heading text
  return convertAll(tree.children, ctx);
}
