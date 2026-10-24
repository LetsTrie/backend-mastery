import { defineCollection, defineConfig, defineSingleton } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { analyzeMdx } from "./src/lib/content/analyze";
import { resolveFigure } from "./src/lib/content/figures";
import { rehypePlugins, remarkPlugins } from "./src/lib/content/mdx";
import {
  authorsSchema,
  bookSchema,
  chapterDocumentSchema,
  glossarySchema,
} from "./src/lib/content/schema";

// Content Collections is an implementation detail of src/lib/content (ADR 0002).
// Nothing outside that folder may import "content-collections".

const chapters = defineCollection({
  name: "chapters",
  directory: "content/chapters",
  include: "*/index.mdx",
  schema: chapterDocumentSchema,
  transform: async (document, context) => {
    const { content, _meta, ...frontmatter } = document;
    const folder = _meta.directory;
    const analysis = analyzeMdx(content);
    const body = await compileMDX(context, document, { remarkPlugins, rehypePlugins });

    return {
      ...frontmatter,
      folder,
      // Raw MDX body, kept for the portable Markdown export (src/lib/llm.ts). Server-only.
      mdx: content,
      isFixture: folder.startsWith("_"),
      body,
      toc: analysis.toc,
      figures: analysis.figures.map((figure) => resolveFigure(folder, frontmatter.slug, figure)),
      citations: analysis.citations,
      words: analysis.words,
      readingMinutes: analysis.readingMinutes,
      openTodos: analysis.todos.length,
    };
  },
});

const book = defineSingleton({
  name: "book",
  filePath: "content/parts.yml",
  parser: "yaml",
  schema: bookSchema,
});

const glossary = defineSingleton({
  name: "glossary",
  filePath: "content/glossary.yml",
  parser: "yaml",
  schema: glossarySchema,
});

const authors = defineSingleton({
  name: "authors",
  filePath: "content/authors.yml",
  parser: "yaml",
  schema: authorsSchema,
  optional: true,
});

export default defineConfig({ content: [chapters, book, glossary, authors] });
