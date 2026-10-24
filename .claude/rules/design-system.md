---
paths:
  - "src/**"
  - "content/_shared/**"
---

# Design system

The goal is a design that still looks right in ten years: a well-set book, not
a trend. When in doubt, remove.

## Principles

1. **Typography is the design.** Most of the page is text; it must be beautiful.
2. **Quiet chrome.** Navigation and UI recede; content and figures lead.
3. **Semantic color.** Color carries meaning (link, focus, warning, failure).
   Never decorative gradients, glows, or glassmorphism.
4. **Tokens, not values.** Components never hard-code a color, size, or spacing.

## Tokens (`src/styles/tokens.css`)

All design values are CSS custom properties, exposed to Tailwind v4 via `@theme`.
Dark mode overrides the same tokens under `[data-theme="dark"]` and
`prefers-color-scheme: dark`.

- **Color:** `--color-bg`, `--color-surface`, `--color-surface-strong`,
  `--color-text`, `--color-muted`, `--color-border`, `--color-accent`,
  `--color-accent-contrast`, `--color-note`, `--color-tip`, `--color-warning`,
  `--color-danger`, `--color-code-bg`, `--color-diagram-accent`,
  `--color-diagram-danger`. Tailwind's default palette is removed
  (`--color-*: initial`), so `bg-bg`, `text-muted`, `border-border` are the only
  color utilities. Warm-gray neutrals, a single accent hue. Diagram palettes in
  `content/_shared/d2/palette-*.d2` mirror these tokens — change both together.
- **Type:** Source Serif 4 (body), Inter (UI and headings), JetBrains Mono (code),
  self-hosted via `next/font` in `src/app/fonts.ts`. Utilities: `font-body`,
  `font-ui`, `font-mono`. Fluid scale `--text-xs` … `--text-3xl` with `clamp()`;
  body 17–19 px, line-height 1.7.
- **Space:** Tailwind's 4 px base unit (`--spacing`; `p-1` = 4 px … `p-16` = 64 px).
- **Radius:** small and consistent (`--radius-sm`, `--radius-md`). No pills
  except tags.

## Layout: the reading grid

Implemented in `src/styles/article.css` (`.reading-grid`, `.prose`, component styles).

A named-line CSS grid on the article:

```
| full | wide | text (≈ 68ch) | wide | full |
```

- Prose sits in `text` (60–75 characters per line).
- `<Figure width="wide">` and tables break out to `wide`; `full` is rare
  (very large architecture overviews).
- `<Aside>` uses the right margin on ≥ 1280 px, inline below.
- Table of contents: sticky left rail on ≥ 1280 px with scroll-spy; a
  collapsible "On this page" at the top on smaller screens.

## Chapter page anatomy

1. Breadcrumb (Part › Chapter) · title · subtitle · meta line
   (authors, published/updated date, reading time, tags).
2. `<KeyTakeaways>`.
3. Body with TOC rail.
4. Prerequisites + "Used in" links, previous/next chapter in reading order.
5. References, revision history, "Edit on GitHub" / report an error link.

## Components

- Every component has: default, hover, focus-visible, and dark states.
- Focus rings always visible (`:focus-visible`), 2 px, accent color, offset.
- Motion: only to clarify (e.g. TOC highlight). Respect `prefers-reduced-motion`.
- Icons: one icon set, outline style, used sparingly and always with a label.

## Things we don't do

Popups, cookie walls beyond legal need, autoplay, infinite scroll, parallax,
dark patterns, newsletter modals, sticky ads, social share bars over content,
"claps", or anything that moves while the reader is reading.
