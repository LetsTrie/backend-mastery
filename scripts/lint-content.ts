/**
 * Content lint — enforces the rules in .claude/rules/ that a machine can check.
 * Run: pnpm lint:content   (part of `pnpm check` and CI)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import { analyzeMdx } from "../src/lib/content/analyze";
import { CALLOUT_LABELS, MDX_COMPONENTS } from "../src/lib/content/catalog";
import { CHAPTERS_DIR, resolveFigure } from "../src/lib/content/figures";
import {
  authorsSchema,
  bookSchema,
  chapterSchema,
  glossarySchema,
  slugPattern,
} from "../src/lib/content/schema";

type Severity = "error" | "warning";
type Problem = { file: string; line?: number; severity: Severity; rule: string; message: string };

const problems: Problem[] = [];
const report = (severity: Severity, file: string, rule: string, message: string, line?: number) =>
  problems.push({ severity, file, rule, message, line });

const CONTENT_DIR = path.join(process.cwd(), "content");
const rel = (file: string) => path.relative(process.cwd(), file);

/** Fixed `##` anchors per blueprint (.claude/rules/chapter-blueprint.md). */
const BLUEPRINTS: Record<string, string[]> = {
  "case-study": [
    "problem-and-scope",
    "requirements",
    "back-of-the-envelope-estimation",
    "api-design",
    "data-model",
    "high-level-design",
    "deep-dives",
    "scaling-and-bottlenecks",
    "reliability-and-failure-modes",
    "observability",
    "security-and-privacy",
    "trade-offs-and-alternatives",
    "evolution",
    "summary",
  ],
  "building-block": [
    "the-problem",
    "how-it-works",
    "variants",
    "in-practice",
    "trade-offs",
    "used-in",
  ],
};

/** The MDX component catalog (.claude/rules/mdx-components.md). */
const CATALOG = new Set<string>(MDX_COMPONENTS);
const CALLOUT_TYPES = new Set(Object.keys(CALLOUT_LABELS));

function loadYaml<T extends z.ZodType>(file: string, schema: T): z.infer<T> | undefined {
  const absolute = path.join(CONTENT_DIR, file);
  const result = schema.safeParse(parseYaml(readFileSync(absolute, "utf8")));
  if (!result.success) {
    for (const issue of result.error.issues) {
      report("error", rel(absolute), "schema", `${issue.path.join(".")}: ${issue.message}`);
    }
    return undefined;
  }
  return result.data;
}

// ── Book-level data ─────────────────────────────────────────────────────
const book = loadYaml("parts.yml", bookSchema);
const glossary = loadYaml("glossary.yml", glossarySchema) ?? {};
const authors = loadYaml("authors.yml", authorsSchema) ?? {};

const folders = readdirSync(CHAPTERS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const existing = new Set(folders.filter((f) => !f.startsWith("_")));
const planned = new Set(book?.parts.flatMap((p) => p.planned) ?? []);
const partKeys = new Set(book?.parts.map((p) => p.key) ?? []);

if (book) {
  const seen = new Set<string>();
  for (const part of book.parts) {
    if (seen.has(part.key)) report("error", "content/parts.yml", "parts", `duplicate part "${part.key}"`);
    seen.add(part.key);
    for (const slug of part.chapters) {
      if (!existing.has(slug)) {
        report("error", "content/parts.yml", "parts", `part "${part.key}" lists missing chapter "${slug}"`);
      }
      if (part.planned.includes(slug)) {
        report("warning", "content/parts.yml", "parts", `"${slug}" is in both chapters and planned`);
      }
    }
  }
}

// ── Chapters ────────────────────────────────────────────────────────────
for (const folder of folders) {
  const file = path.join(CHAPTERS_DIR, folder, "index.mdx");
  const shown = rel(file);
  if (!existsSync(file)) {
    const outlineOnly = existsSync(path.join(CHAPTERS_DIR, folder, "outline.md"));
    report(
      outlineOnly ? "warning" : "error",
      rel(path.dirname(file)),
      "structure",
      outlineOnly ? "outline only — awaiting approval to draft" : "chapter folder has no index.mdx",
    );
    continue;
  }

  const source = readFileSync(file, "utf8");
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!fm) {
    report("error", shown, "frontmatter", "missing frontmatter block");
    continue;
  }
  const offset = fm[0].split("\n").length - 1;
  const at = (line?: number) => (line === undefined ? undefined : line + offset);

  const parsed = chapterSchema.safeParse(parseYaml(fm[1] ?? ""));
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      report("error", shown, "frontmatter", `${issue.path.join(".")}: ${issue.message}`);
    }
    continue;
  }
  const chapter = parsed.data;
  const isFixture = folder.startsWith("_");
  const published = chapter.status === "published";

  // Identity and placement
  if (chapter.slug !== folder) {
    report("error", shown, "frontmatter", `slug "${chapter.slug}" must equal folder name "${folder}"`);
  }
  if (!partKeys.has(chapter.part)) {
    report("error", shown, "frontmatter", `unknown part "${chapter.part}"`);
  } else if (!isFixture && !book?.parts.find((p) => p.key === chapter.part)?.chapters.includes(chapter.slug)) {
    report("error", shown, "parts", `not listed under part "${chapter.part}" in content/parts.yml`);
  }
  for (const key of [...chapter.authors, ...chapter.reviewers]) {
    if (!(key in authors)) report("error", shown, "frontmatter", `unknown author "${key}" (content/authors.yml)`);
  }
  for (const slug of chapter.prerequisites) {
    if (existing.has(slug)) continue;
    if (planned.has(slug)) report("warning", shown, "links", `prerequisite "${slug}" is planned but not written yet`);
    else report("error", shown, "links", `prerequisite "${slug}" does not exist`);
  }
  for (const alias of chapter.aliases) {
    if (existing.has(alias)) report("error", shown, "permanence", `alias "${alias}" collides with an existing chapter`);
  }

  // Body
  const analysis = analyzeMdx(source.slice(fm[0].length));

  for (const node of analysis.esm) report("error", shown, "mdx", "import/export is not allowed in content", at(node.line));
  for (const node of analysis.images) report("error", shown, "mdx", "use <Figure>, not Markdown images", at(node.line));
  for (const node of analysis.expressions) {
    if (!node.comment) report("error", shown, "mdx", "JSX expressions are not allowed in content", at(node.line));
    else if (published || chapter.status === "review") {
      report(published ? "error" : "warning", shown, "mdx", "remove guidance comments before review", at(node.line));
    }
  }
  for (const use of analysis.jsx) {
    if (/^[a-z]/.test(use.name)) report("error", shown, "mdx", `raw HTML <${use.name}> is not allowed`, at(use.line));
    else if (!CATALOG.has(use.name)) report("error", shown, "mdx", `<${use.name}> is not in the component catalog`, at(use.line));
    if (use.name === "Callout" && typeof use.attrs.type === "string" && !CALLOUT_TYPES.has(use.attrs.type)) {
      report("error", shown, "mdx", `unknown Callout type "${use.attrs.type}"`, at(use.line));
    }
    if (use.name === "Cite") {
      const href = use.attrs.href;
      if (typeof href !== "string" || !/^https?:\/\//.test(href)) report("error", shown, "citations", "<Cite> needs an absolute http(s) href", at(use.line));
      if (typeof use.attrs.title !== "string" || !use.attrs.title) report("error", shown, "citations", "<Cite> needs a title", at(use.line));
    }
  }

  // Structure
  for (const heading of analysis.headings) {
    if (heading.depth === 1) report("error", shown, "headings", "no # H1 in content; the title comes from frontmatter", at(heading.line));
    if (heading.depth > 4) report("error", shown, "headings", "headings deeper than #### are not allowed", at(heading.line));
  }
  const blueprint = BLUEPRINTS[chapter.kind];
  if (blueprint && !(isFixture && chapter.kind === "essay")) {
    const h2 = analysis.headings.filter((h) => h.depth === 2).map((h) => h.id);
    const missing = blueprint.filter((id) => !h2.includes(id));
    if (missing.length) report("error", shown, "blueprint", `missing ## sections: ${missing.join(", ")}`);
    const order = blueprint.filter((id) => h2.includes(id));
    const actual = h2.filter((id) => blueprint.includes(id));
    if (!missing.length && order.join() !== actual.join()) report("error", shown, "blueprint", "## sections are out of blueprint order");
  }

  // Figures
  const figureIds = new Set<string>();
  for (const figure of analysis.figures) {
    const line = at(figure.line);
    if (!slugPattern.test(figure.id) || figure.id.startsWith("_")) report("error", shown, "figures", `figure id "${figure.id}" must be kebab-case`, line);
    if (figureIds.has(figure.id)) report("error", shown, "figures", `duplicate figure id "${figure.id}"`, line);
    figureIds.add(figure.id);
    if (!figure.alt) report("error", shown, "figures", `figure "${figure.id}" needs alt text`, line);
    else if (figure.alt.length < 20) report("warning", shown, "figures", `figure "${figure.id}" alt text is too short to describe the flow`, line);
    if (!figure.caption) report("error", shown, "figures", `figure "${figure.id}" needs a caption`, line);
    if (!figure.src.startsWith("./figures/")) {
      report("error", shown, "figures", `figure src must start with ./figures/ (got "${figure.src}")`, line);
      continue;
    }
    const resolved = resolveFigure(folder, chapter.slug, figure);
    if (!resolved.exists) report("error", shown, "figures", `figure file not found: ${figure.src} (run pnpm diagrams?)`, line);
    else if (!resolved.hasSource) report("error", shown, "figures", `no editable source (.d2/.excalidraw/.csv) next to ${figure.src}`, line);
    else if (figure.src.endsWith(".svg") && !resolved.darkUrl) report("warning", shown, "figures", `no dark variant for ${figure.src}`, line);
  }
  const referenced = new Set(analysis.figRefs.map((r) => r.id));
  for (const ref of analysis.figRefs) {
    if (!figureIds.has(ref.id)) report("error", shown, "figures", `<FigRef id="${ref.id}"> has no matching <Figure>`, at(ref.line));
  }
  for (const figure of analysis.figures) {
    if (!referenced.has(figure.id)) report("warning", shown, "figures", `figure "${figure.id}" is never referenced with <FigRef>`, at(figure.line));
  }

  // Glossary terms
  for (const term of analysis.terms) {
    if (!(term.id in glossary)) report("error", shown, "glossary", `<Term id="${term.id}"> is not in content/glossary.yml`, at(term.line));
  }

  // Links
  const anchors = new Set([
    ...analysis.headings.map((h) => h.id),
    ...[...figureIds].map((id) => `fig-${id}`),
    "key-takeaways",
    "references",
  ]);
  for (const link of analysis.links) {
    const line = at(link.line);
    const chapterLink = /^\/chapters\/([^/#?]+)/.exec(link.url);
    if (chapterLink?.[1]) {
      const target = chapterLink[1];
      if (existing.has(target)) continue;
      if (planned.has(target)) report(published ? "error" : "warning", shown, "links", `links to unwritten chapter "${target}"`, line);
      else report("error", shown, "links", `broken chapter link ${link.url}`, line);
    } else if (link.url.startsWith("/glossary#")) {
      const id = link.url.slice("/glossary#".length);
      if (!(id in glossary)) report("error", shown, "links", `unknown glossary anchor ${link.url}`, line);
    } else if (link.url.startsWith("#") && !anchors.has(link.url.slice(1))) {
      report("warning", shown, "links", `anchor ${link.url} not found in this chapter`, line);
    }
  }

  // Honesty
  for (const todo of analysis.todos) {
    report(published ? "error" : "warning", shown, "todo", todo.text, at(todo.line));
  }
}

// ── Report ──────────────────────────────────────────────────────────────
const errors = problems.filter((p) => p.severity === "error");
const warnings = problems.filter((p) => p.severity === "warning");
const color = (code: number, text: string) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);

for (const p of problems.sort((a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0))) {
  const where = p.line ? `${p.file}:${p.line}` : p.file;
  const label = p.severity === "error" ? color(31, "error  ") : color(33, "warning");
  console.log(`${where}\n  ${label} ${p.message}  ${color(90, `[${p.rule}]`)}`);
}
console.log(
  `\n${folders.length} chapter folder(s) checked · ${color(31, `${errors.length} error(s)`)} · ${color(33, `${warnings.length} warning(s)`)}`,
);
process.exit(errors.length > 0 ? 1 : 0);
