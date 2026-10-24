# 0002. Static-first Next.js with a content adapter

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

A reading site needs fast pages, cheap hosting, and near-zero operational
burden. The team already knows React. Content tooling in the ecosystem changes
frequently (Contentlayer was abandoned; others come and go).

## Decision

- **Next.js 16 App Router**, React 19, TypeScript strict, Tailwind CSS v4.
- **Every page is statically generated.** No runtime database; no request-time
  rendering for content. Hosted on Vercel, but the output must remain portable.
- **Content Collections** (`@content-collections/*`) loads and validates MDX
  with a Zod schema at build time.
- All content access goes through `src/lib/content/` (the *content adapter*).
  No other module imports the content library directly, so it can be replaced
  in one place.
- Shiki (via rehype-pretty-code) for build-time code highlighting with dual
  light/dark themes.
- **Cache Components (`cacheComponents`) stay off.** With it on, every
  `generateStaticParams` must return at least one entry, which breaks the build
  whenever a route has no published content yet (no chapters at launch, an
  unused tag). Plain SSG with `dynamicParams = false` gives the same fully static
  output. Revisit only if we need request-time rendering.
- MDX output depends only on the MDX source. Data from other files (figure
  numbers, SVG sizes, citations, glossary) is computed in the collection
  transform and injected through per-chapter bound components.

## Alternatives considered

| Option                    | Pros                              | Cons                                              |
| ------------------------- | --------------------------------- | ------------------------------------------------- |
| Astro                     | Content-first, ships less JS      | Team prefers React/Next ecosystem                 |
| Docs frameworks (Fumadocs, Nextra) | Fast start                | Opinionated layout; harder to own the design long-term |
| Velite                    | Similar feature set               | Smaller ecosystem; still pre-1.0                  |
| `@next/mdx` + own loader  | Fewest dependencies               | We'd rebuild frontmatter validation and indexing  |

## Consequences

- Build time grows with chapter count; acceptable for hundreds of chapters.
- Dynamic features (search, newsletter) must be add-ons that don't affect
  page rendering (e.g. a static search index such as Pagefind).
- If Content Collections is abandoned, only `src/lib/content/` changes.
