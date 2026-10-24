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
   Newsreader for headlines and reading text; Geist for interface only.
2. **Quiet chrome.** Navigation and UI recede; content and figures lead.
3. **Semantic color.** Color carries meaning (link, focus, state, failure). One
   accent (ember). Decoration is rare and quiet, and never inside reading content:
   the home hero may use its dot grid and soft glow; the sticky header may be
   translucent with a backdrop blur. Chapter bodies get tints, not gradients or glows.
4. **Tokens, not values.** Components never hard-code a color, size, or spacing.
5. **Modern CSS, progressively enhanced.** Use the platform: `light-dark()`, OKLCH,
   `color-mix()`, `:has()`, `text-wrap`, `initial-letter`, scroll-driven animations.
   Every enhancement is behind `@supports` (or degrades harmlessly) so older
   browsers get a complete, plain page.

## Tokens (`src/styles/tokens.css`)

All design values are CSS custom properties, exposed to Tailwind v4 via `@theme`.
Each color is declared **once** with `light-dark(light, dark)` in OKLCH; the active
value follows `color-scheme`, which comes from the OS or from the reader's choice
(`[data-theme]`). Print overrides the same names in `src/styles/print.css`, so
never rename a token without updating print.

- **Neutrals:** `--color-bg`, `--color-surface`, `--color-surface-strong`,
  `--color-text`, `--color-muted`, `--color-subtle` (decoration only, never body
  text), `--color-border`, `--color-border-strong`.
- **Accent:** `--color-accent`, `--color-accent-strong`, `--color-accent-soft`
  (tinted fills), `--color-accent-contrast` (text on accent).
- **Semantic:** `--color-note`, `--color-tip`, `--color-warning`, `--color-danger`.
- **Code and figures:** `--color-code-bg`; `--color-figure` must equal N7 in
  `content/_shared/d2/palette-*.d2` so diagrams sit seamlessly in their frames.
  `--color-diagram-accent` / `--color-diagram-danger` mirror the D2 classes.
- Tailwind's default palette is removed (`--color-*: initial`), so utilities like
  `bg-bg`, `text-muted`, `border-border`, `bg-accent-soft` are the only colors.
- **Type:** Newsreader for body and display (`--font-body`, `--font-display`,
  optical sizes on), Geist for interface (`--font-ui`), Geist Mono for code
  (`--font-mono`). Self-hosted via `next/font` in `src/app/fonts.ts`. Fluid scale
  `--text-xs` … `--text-4xl` with `clamp()`; restrained sizes: body 16–18 px,
  UI text 13–14 px, line-height 1.6, measure 76ch (≈ 750 px at 18 px).
  Labels: uppercase, `--tracking-label`. Display: `--tracking-display`.
- **Space:** Tailwind's 4 px base unit (`--spacing`).
- **Radius:** `--radius-sm` (6), `--radius-md` (10), `--radius-lg` (16),
  `--radius-full` for buttons, chips, and status pills.
- **Elevation:** `--shadow-sm` / `--shadow-md` / `--shadow-lg`, soft and layered,
  reserved for hover, popovers, and floating controls.
- **Motion:** `--ease-out`, `--duration-fast` (140 ms), `--duration-base` (220 ms).

## Layout

- Page container: `.container-page` (max `--width-page`, 84rem, fluid side padding).
  The header, footer, and chapter layout share this width so the logo, sidebar,
  and content edges line up.
- The article is a named-line CSS grid (`src/styles/article.css`):

```
| full | wide | text (≈ 68ch) | wide | full |
```

- Prose sits in `text`, and so do tables, estimates, trade-offs, and code:
  their edges align with the paragraphs. Only `<Figure width="wide">` breaks out
  to `wide`; `full` is rare.
- Beside the sidebar (≥ 1280 px) the text fills the column up to
  `--measure-wide` (92ch), with a 2.5rem gap on the left and a 2rem breakout
  gutter for wide figures; don't leave an empty right margin. Below that, text is
  `--measure` (76ch) with `--breakout` (4.5rem) gutters.
- `<Aside>` renders inline, as a tinted note, at every width.
- Table of contents: sticky left rail on ≥ 1280 px, separated from the content
  by a 1 px right border, with scroll-spy (the active section is the last heading
  scrolled past). Below 1280 px there is no table of contents.
- The rail collapses to a single toggle button (`TocToggle`, beside "On this
  page"); collapsed, the article centers in the freed space. The choice persists
  in `localStorage` and is restored before first paint by
  `src/components/ui/pre-paint.ts`. Pre-paint scripts live in that plain module,
  never in a `"use client"` file: a server component importing a value from a
  client module gets a client reference, not the string.
- Header height is `--header-height`; anchors use `scroll-padding-top`, never
  per-element offsets.

## Shared components (`src/app/globals.css`)

`.btn` + `.btn-primary` / `.btn-secondary`, `.icon-button`, `.chip`/`.badge`,
`.status`, `.eyebrow`, `.display`, `.lede`, `.card` (+ `.card-link`, `.card-cover`
for whole-card links), `.section-label`, `.chapter-row`, `.nav-link`,
`.reading-progress`, `.back-to-top`. Reuse these before writing new styles.

The floating **back-to-top** button (every page, bottom-right) is a plain link to
`#main`, no JavaScript. It fades in over the first screen of scrolling via a
scroll-driven animation, stays hidden on pages too short to scroll, and is
always visible in browsers without scroll-driven animations. It is the only
floating control; don't add others.

## Chapter page anatomy

1. Eyebrow (chapter number, kind) · title · subtitle · "Last updated <date>"
   (from `updated`). No breadcrumb.
2. `#tag` chips, then a quiet notice for draft, review, or archived. No byline
   strip on screen (no author, published date, reading time, or counts); print
   shows a one-line byline (author · date · URL) instead.
3. The body. Blueprint `##` sections are numbered (01, 02…)
   by CSS counters; the first paragraph gets a drop cap where supported.
4. End matter: related chapters (chips), references and further reading, how
   to cite, edit/report links, previous/next cards. The `revisions` frontmatter
   is kept as a record but not rendered.
5. A reading-progress hairline under the header (scroll-driven; absent where
   unsupported).

## Components

- Every component has: default, hover, focus-visible, and dark states.
- Focus rings always visible (`:focus-visible`), 2 px, accent color, offset.
- Motion only clarifies or responds to the reader (hover, scroll position, TOC
  marker). Nothing animates on its own. Respect `prefers-reduced-motion`.
- Logo: a "B" monogram (`LogoMark`, and `src/app/icon.svg` for the favicon) on an
  ember square. Never stacked horizontal bars: at the top-left they read as a
  menu button.
- Icons: the set in `src/components/ui/icons.tsx` (24 px grid, 1.75 stroke,
  currentColor). Decorative icons are `aria-hidden`; icon-only buttons get a label.
- Hidden overlays (tooltips) use `display: none`, never `visibility: hidden`, so
  they cannot create page overflow.

## Print and PDF

Printing is a first-class output (`src/styles/print.css`): readers print or save
a PDF with the browser (Cmd/Ctrl+P); there is no print button by design. Rules for anything that renders in a chapter:

- Site chrome and interactive-only elements get `print-hide`; print-only details
  (chapter kicker, canonical URL) get `print-only`.
- Print forces light tokens, `pt` typography (body 10 pt, line-height 1.42), no
  background fills (rules and borders instead), and page numbers plus a running
  header via `@page` margin boxes.
- Figures print at ≈ 0.17 mm per diagram pixel, capped to the page width and a
  single page's height, light variant only. Tables and code never scroll in print:
  tables repeat their header row; code wraps.
- Every component must stay legible in print: check `/chapters/_kitchen-sink`
  with the print preview after any design change.

## Things we don't do

Popups, cookie walls beyond legal need, autoplay, infinite scroll, parallax,
dark patterns, newsletter modals, sticky ads, social share bars over content,
"claps", or anything that moves while the reader is reading.
