---
paths:
  - "src/**"
  - "scripts/**"
  - "*.config.*"
  - "package.json"
---

# Next.js engineering

## Architecture

- **Static by default, static forever.** Every route is prerendered at build time
  via `generateStaticParams`. No request-time data, no runtime database, no
  server actions for content. If a feature needs a server (newsletter signup,
  search API), it is isolated in its own route handler and the page still works
  if that handler is down.
- **Content boundary.** Only `src/lib/content/` imports from the content library
  (Content Collections). Everything else uses its typed functions:
  `getChapter(slug)`, `getAllChapters({ includeDrafts })`, `getPart(key)`,
  `getGlossary()`. Swapping the content pipeline must touch only that folder.
- **Routes are thin.** `src/app/**/page.tsx` fetches via `lib/content`, then
  composes components. No business logic in pages.
- Server Components by default. `"use client"` only for genuine interaction
  (theme toggle, tabs, copy button, search). Keep client components leaf-level
  and small.

## Routes (stable public surface)

| Route                         | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `/`                           | Home: latest + featured chapters                |
| `/chapters`                   | Table of contents, grouped by part              |
| `/chapters/[slug]`            | A chapter                                       |
| `/parts/[part]`               | Part landing page                               |
| `/tags/[tag]`                 | Chapters by tag                                 |
| `/glossary`                   | All terms, with `#term-id` anchors              |
| `/feed.xml`, `/atom.xml`      | Full-content RSS / Atom                         |
| `/sitemap.xml`, `/robots.txt` | Generated                                       |
| `/chapters/[slug]/opengraph-image` | Generated social card                      |

These URLs are permanent. See `permanence-and-seo.md`.

## TypeScript and code style

- `strict: true`, `noUncheckedIndexedAccess: true`. No `any`; use `unknown` and narrow.
- Named exports for components (except Next.js special files). One component per file.
- File names kebab-case (`key-takeaways.tsx`); components PascalCase.
- Absolute imports via `@/` alias.
- Prefer platform features over libraries (CSS over JS animation, `<details>`
  over an accordion lib, `Intl` over date libs).
- ESLint (`next/core-web-vitals` + `typescript-eslint` strict) and Prettier.
  CI fails on warnings.

## Dependencies

- Ask before adding a runtime dependency. Justify: what it replaces, its bundle
  cost, its maintenance health (recent releases, >1 maintainer).
- Pin exact versions in `package.json`. Renovate/Dependabot groups minor updates.
- Build-time-only work (Shiki, D2, content validation) stays out of the client bundle.

## Content pipeline

- Only `content/chapters/<slug>/index.mdx` is a chapter. Folders starting with
  `_` (`_template`, `_kitchen-sink`) are design fixtures: rendered in dev and
  preview builds only, never listed, never in production. Working files like
  `outline.md` are never rendered.
- Cache Components are **off** (ADR 0002). Dynamic segments export
  `dynamicParams = false` and `generateStaticParams`. In `pnpm dev`, the param
  list is cached: after creating a **new chapter folder**, restart the dev
  server or the new URL returns 404. Edits to existing chapters hot-reload.
- Figures are served from `content/` by the static route
  `/chapters/[slug]/figures/[file]`; never copy them into `public/`.
- MDX plugins may depend only on the MDX source (compiled output is cached by
  content). Cross-file data (figure numbers and sizes, citations, glossary) is
  computed in the `content-collections.ts` transform and bound to components in
  `src/components/mdx/index.tsx`.
- MDX → compiled at build time. Remark/rehype plugins in `src/lib/content/mdx.ts`:
  GFM tables, heading slugs (stable, see permanence rules), Shiki dual themes,
  figure numbering, citation collection.
- Content lint (`scripts/lint-content.ts`) runs in `pnpm check` and CI:
  frontmatter schema, allowed components only, `<Figure>` alt text present,
  `<FigRef>` targets exist, internal links resolve, prerequisites exist,
  figure source files exist, no `TODO(verify)` in `published` chapters.

## Testing

- Unit tests (Vitest) for `src/lib/**` — slugging, figure numbering, reading time.
- *Not yet set up:* Playwright smoke test (every chapter route renders, has an
  `<h1>`, no console errors, no broken internal links) and visual regression on
  the `_kitchen-sink` fixture. Until then, check `/chapters/_kitchen-sink` in
  light, dark, and mobile after any design change.
- `pnpm build` must pass with zero warnings before merge.

## Definition of done (code)

1. `pnpm check` and `pnpm build` pass.
2. Works with JavaScript disabled (core reading experience).
3. Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO for a
   long chapter on mobile.
4. No layout shift from fonts or figures (CLS ≈ 0).
