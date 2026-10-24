/**
 * Static analysis of a chapter's MDX body. Pure (no file system), so it is shared by
 * the content build (TOC, figure numbers, citations, reading time) and the content lint.
 */
import type { Root, RootContent } from "mdast";
import type {} from "mdast-util-mdx";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { assignHeadingIds, type HeadingInfo, type TocItem } from "./headings";

const WORDS_PER_MINUTE = 230;

type AttrValue = string | true | { expression: string };
export type JsxUse = { name: string; line?: number; attrs: Record<string, AttrValue> };

export type FigureWidth = "text" | "wide" | "full";
export type FigureUse = {
  id: string;
  number: number;
  src: string;
  alt: string;
  caption: string;
  width: FigureWidth;
  line?: number;
};

export type Citation = { n: number; href: string; title: string; author?: string; year?: string };
type Located = { line?: number };

export type Analysis = {
  headings: HeadingInfo[];
  toc: TocItem[];
  jsx: JsxUse[];
  figures: FigureUse[];
  figRefs: ({ id: string } & Located)[];
  terms: ({ id: string } & Located)[];
  citations: Citation[];
  links: ({ url: string } & Located)[];
  images: Located[];
  esm: Located[];
  expressions: ({ comment: boolean } & Located)[];
  todos: ({ text: string } & Located)[];
  words: number;
  readingMinutes: number;
};

export function parseMdx(source: string): Root {
  return unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source);
}

function attrString(attrs: Record<string, AttrValue>, name: string): string {
  const value = attrs[name];
  return typeof value === "string" ? value : "";
}

function readAttrs(node: MdxJsxFlowElement | MdxJsxTextElement): Record<string, AttrValue> {
  const attrs: Record<string, AttrValue> = {};
  for (const attr of node.attributes) {
    if (attr.type !== "mdxJsxAttribute") continue;
    if (attr.value == null) attrs[attr.name] = true;
    else if (typeof attr.value === "string") attrs[attr.name] = attr.value;
    else attrs[attr.name] = { expression: attr.value.value };
  }
  return attrs;
}

const commentOnly = /^\s*\/\*[\s\S]*\*\/\s*$/;

export function analyzeMdx(source: string): Analysis {
  const tree = parseMdx(source);
  const headings = assignHeadingIds(tree);
  const result: Analysis = {
    headings,
    toc: headings
      .filter((h): h is HeadingInfo & { depth: 2 | 3 } => h.depth === 2 || h.depth === 3)
      .map(({ depth, id, text }) => ({ depth, id, text })),
    jsx: [],
    figures: [],
    figRefs: [],
    terms: [],
    citations: [],
    links: [],
    images: [],
    esm: [],
    expressions: [],
    todos: [],
    words: 0,
    readingMinutes: 1,
  };

  const citationsByHref = new Map<string, Citation>();

  visit(tree, (node: Root | RootContent) => {
    const line = node.position?.start.line;
    switch (node.type) {
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement": {
        if (!node.name) break;
        const attrs = readAttrs(node);
        result.jsx.push({ name: node.name, line, attrs });
        if (node.name === "Figure") {
          const width = attrString(attrs, "width");
          result.figures.push({
            id: attrString(attrs, "id"),
            number: result.figures.length + 1,
            src: attrString(attrs, "src"),
            alt: attrString(attrs, "alt"),
            caption: attrString(attrs, "caption"),
            width: width === "wide" || width === "full" ? width : "text",
            line,
          });
        } else if (node.name === "FigRef") {
          result.figRefs.push({ id: attrString(attrs, "id"), line });
        } else if (node.name === "Term") {
          result.terms.push({ id: attrString(attrs, "id"), line });
        } else if (node.name === "Cite") {
          const href = attrString(attrs, "href");
          if (href && !citationsByHref.has(href)) {
            citationsByHref.set(href, {
              n: citationsByHref.size + 1,
              href,
              title: attrString(attrs, "title"),
              ...(attrs.author ? { author: attrString(attrs, "author") } : {}),
              ...(attrs.year ? { year: attrString(attrs, "year") } : {}),
            });
          }
        }
        break;
      }
      case "link":
        result.links.push({ url: node.url, line });
        break;
      case "image":
        result.images.push({ line });
        break;
      case "mdxjsEsm":
        result.esm.push({ line });
        break;
      case "mdxFlowExpression":
      case "mdxTextExpression":
        result.expressions.push({ comment: commentOnly.test(node.value), line });
        break;
      case "text":
      case "inlineCode":
        result.words += node.value.split(/\s+/).filter(Boolean).length;
        break;
    }
  });

  result.citations = [...citationsByHref.values()];
  result.readingMinutes = Math.max(1, Math.round(result.words / WORDS_PER_MINUTE));

  source.split("\n").forEach((text, index) => {
    if (text.includes("TODO(verify)")) result.todos.push({ text: text.trim(), line: index + 1 });
  });

  return result;
}
