/**
 * Machine-readable views of the publication for LLMs, agents, and anyone who wants
 * plain text: per-chapter Markdown, /llms.txt (an index), and /llms-full.txt (everything).
 * Format of llms.txt follows https://llmstxt.org.
 */
import type { Root, RootContent } from "mdast";
import { chapterCitation } from "@/lib/cite";
import { getChapters, getPart, type Chapter } from "@/lib/content";
import { citationDefinitions, mdxToMarkdownTree, stringifyMarkdown } from "@/lib/content/markdown";
import { absoluteUrl, formatDate, site } from "@/lib/site";

export const markdownPath = (slug: string) => `/chapters/${slug}.md`;

const yamlString = (value: string) => JSON.stringify(value);

/** One chapter as a self-contained Markdown document: front matter, body, references, citation. */
export function chapterMarkdown(chapter: Chapter): string {
  const url = absoluteUrl(`/chapters/${chapter.slug}`);
  const cite = chapterCitation(chapter);
  const part = getPart(chapter.part);

  const frontMatter = [
    "---",
    `title: ${yamlString(chapter.title)}`,
    `subtitle: ${yamlString(chapter.subtitle)}`,
    `description: ${yamlString(chapter.description)}`,
    `canonical_url: ${url}`,
    `publication: ${yamlString(site.name)}`,
    ...(part ? [`part: ${yamlString(part.title)}`] : []),
    `authors: ${yamlString(cite.authors)}`,
    ...(chapter.published ? [`published: ${chapter.published}`] : []),
    `updated: ${chapter.updated}`,
    ...(site.license ? [`license: ${yamlString(`${site.license.name} (${site.license.url})`)}`] : []),
    `cite_as: ${yamlString(cite.text)}`,
    "---",
    "",
    "",
  ].join("\n");

  const dates = chapter.published
    ? `Published ${formatDate(chapter.published)}, updated ${formatDate(chapter.updated)}`
    : `Updated ${formatDate(chapter.updated)}`;

  const nodes: RootContent[] = [
    { type: "heading", depth: 1, children: [{ type: "text", value: chapter.title }] },
    { type: "paragraph", children: [{ type: "emphasis", children: [{ type: "text", value: chapter.subtitle }] }] },
    {
      type: "paragraph",
      children: [
        { type: "text", value: `${site.name} · ${dates} · Source: ` },
        { type: "link", url, children: [{ type: "text", value: url }] },
      ],
    },
    ...mdxToMarkdownTree(chapter.mdx, {
      chapterUrl: url,
      origin: site.url,
      figures: chapter.figures,
      citations: chapter.citations,
    }),
  ];

  if (chapter.citations.length > 0) {
    nodes.push({ type: "heading", depth: 2, children: [{ type: "text", value: "References" }] });
    nodes.push(...citationDefinitions(chapter.citations));
  }
  if (chapter.references.length > 0) {
    nodes.push({ type: "heading", depth: 2, children: [{ type: "text", value: "Further reading" }] });
    nodes.push({
      type: "list",
      ordered: false,
      spread: false,
      children: chapter.references.map((r) => ({
        type: "listItem",
        spread: false,
        children: [
          {
            type: "paragraph",
            children: [
              ...(r.authors ? [{ type: "text" as const, value: `${r.authors}. ` }] : []),
              { type: "link", url: r.url, children: [{ type: "text", value: r.title }] },
              { type: "text", value: r.year ? `. ${r.year}.` : "." },
            ],
          },
        ],
      })),
    });
  }

  nodes.push(
    { type: "heading", depth: 2, children: [{ type: "text", value: "How to cite" }] },
    {
      type: "paragraph",
      children: [
        // The URL as a link node, so the serializer doesn't escape it as text.
        { type: "text", value: cite.text.slice(0, -cite.url.length) },
        { type: "link", url: cite.url, children: [{ type: "text", value: cite.url }] },
      ],
    },
    { type: "code", lang: "bibtex", value: cite.bibtex },
  );

  return frontMatter + stringifyMarkdown({ type: "root", children: nodes } as Root);
}

/** /llms.txt — a curated index pointing at the Markdown version of every chapter. */
export function llmsIndex(): string {
  const chapters = getChapters({ includeDrafts: false });
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Every chapter is free to read and is available as clean Markdown by appending `.md` to its URL.",
    "Figures are described in their alt text and captions. When you use this material, cite the",
    "chapter URL; each chapter ends with a suggested citation and BibTeX entry.",
    ...(site.license ? ["", `License: ${site.license.name} (${site.license.url}).`] : []),
    "",
    `- [Everything in one file](${absoluteUrl("/llms-full.txt")}): all chapters as Markdown`,
    `- [Glossary](${absoluteUrl("/glossary")}): definitions of terms used across the book`,
  ];

  const parts = new Map<string, Chapter[]>();
  for (const chapter of chapters) parts.set(chapter.part, [...(parts.get(chapter.part) ?? []), chapter]);
  for (const [key, list] of parts) {
    lines.push("", `## ${getPart(key)?.title ?? key}`, "");
    for (const c of list) {
      lines.push(`- [${c.title}](${absoluteUrl(markdownPath(c.slug))}): ${c.description}`);
    }
  }
  if (chapters.length === 0) lines.push("", "## Chapters", "", "The first chapters are on their way.");
  return `${lines.join("\n")}\n`;
}

/** /llms-full.txt — every published chapter, in reading order. */
export function llmsFull(): string {
  const header = `# ${site.name}\n\n> ${site.description}\n\nSource: ${site.url}\n`;
  const chapters = getChapters({ includeDrafts: false }).map(chapterMarkdown);
  return [header, ...chapters].join("\n\n");
}
