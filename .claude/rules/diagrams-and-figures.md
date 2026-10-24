---
paths:
  - "content/**"
  - "scripts/**diagram*"
---

# Diagrams and figures

Diagrams are the most-shared, most-remembered part of a chapter. They are
**code**: diffable, reviewable, re-themeable, and consistent across the book.

## Tooling

| Figure type                               | Tool                         | Source file          |
| ----------------------------------------- | ---------------------------- | -------------------- |
| Architecture, data flow, deployment       | D2                           | `<id>.d2`            |
| Sequence diagrams                         | D2 (`shape: sequence_diagram`) | `<id>.d2`          |
| State machines, ER / table layouts        | D2 (`shape: sql_table` for ER) | `<id>.d2`          |
| Charts (latency curves, capacity)         | Data file rendered to SVG by `scripts/` at build time | `<id>.csv` |
| Hand-drawn concept sketches (rare)        | Excalidraw                   | `<id>.excalidraw`    |
| Screenshots (dashboards, consoles)        | PNG → AVIF/WebP by `next/image` | `<id>.png`        |

**Always commit the source next to the output.** A figure without a source file
can't be edited and will be rejected in review.

## File layout

```
content/chapters/<slug>/figures/
  high-level-design.d2          ← source (hand-written)
  high-level-design.svg         ← generated, light theme
  high-level-design.dark.svg    ← generated, dark theme
```

- `pnpm diagrams` regenerates every SVG. `pnpm diagrams:check` fails CI when an
  SVG is stale. Never hand-edit generated SVGs.
- File names = figure `id`. Kebab-case. Descriptive (`fanout-retry-sequence`,
  not `fig3`).

## The visual language (shared across every chapter)

Every `.d2` file starts with:

```d2
...@../../../_shared/d2/base
```

which provides the layout engine, the warm-neutral palette, and the **node
classes** below. Use classes; never style nodes ad hoc (no inline `style.fill`
in chapter diagrams).

Shared files in `content/_shared/d2/`: `classes.d2` (classes + layout),
`palette-light.d2` / `palette-dark.d2` (colors mirroring `tokens.css`),
`base.d2` (classes + light; what chapters import) and `base-dark.d2` (used only
by the render script, which swaps the import to produce `<id>.dark.svg`).

| Concept                         | Class        | Shape        | Meaning                          |
| ------------------------------- | ------------ | ------------ | -------------------------------- |
| End user / actor                | `actor`      | person       | Human or external client         |
| Client app                      | `client`     | rectangle    | Mobile, web, CLI                 |
| Our service                     | `service`    | rectangle    | A process we own and deploy      |
| Load balancer / gateway         | `gateway`    | hexagon      | Routing, auth, rate limits       |
| Database                        | `datastore`  | cylinder     | Durable storage                  |
| Cache                           | `cache`      | stored_data  | In-memory, loss-tolerant         |
| Queue / stream / topic          | `queue`      | queue        | Async buffer                     |
| Object / blob storage           | `blob`       | page         | Files, media                     |
| Third-party / external provider | `external`   | cloud        | Not ours (APNs, Twilio, …)       |
| Scheduled / batch job           | `job`        | rectangle (dashed) | Cron, batch, offline       |
| Logical group / boundary        | `boundary`   | container (dashed) | Region, VPC, team boundary |
| State (state machines only)     | `state`      | pill (rounded) | A lifecycle state, not a component |

Edges:
- Solid arrow = synchronous request. Dashed arrow (`class: async`) = asynchronous
  message. Label edges with the verb or protocol: `"enqueue"`, `"gRPC"`, `"HTTPS"`.
- Numbered steps prefix the edge label with circled digits (`"① enqueue"`,
  `"② dispatch"`) and match the `<Steps>` list in the prose one-to-one.
- ER diagrams (`sql_table`) always draw their references: link the referring
  column to the key it points to with `a.col <-> b.key: {class: reference}`
  (crow's foot = many, double bar = exactly one; `<->` so both ends render), and
  mark the column `{constraint: foreign_key}` (or `[primary_key; foreign_key]`).
  Keep edge labels off ER links; explain special cases in the caption.
- Failure / error paths use `class: failure` (dashed, red, always labeled).
- Highlight the part a deep dive focuses on with `class: focus` (accent color);
  everything else stays neutral. At most one focused area per figure.

Color is **semantic, not decorative**: neutral for everything, one accent for
focus, red only for failures/error paths. Never rely on color alone — failure
paths are also dashed-red *and* labeled.

## Composition rules

- One idea per figure. If the caption needs "and", consider two figures.
- ≤ 12 nodes per figure. Overviews may go to ~18 using `boundary` groups.
- Left-to-right for request flow (`direction: right`), top-to-bottom for layers.
- Names in diagrams exactly match names in the prose (`Notification API`, not
  `notif-svc` in one and `Notification Service` in the other).
- Reuse an evolving overview: `high-level-design` → `scaled-design` should look
  like the same system with additions, same positions where possible.
- Text in figures ≥ 14 px when rendered. A figure is shown at most ~900 px wide
  (`wide`), so keep the SVG's native width ≲ 1,100 px: prefer `direction: down`
  for overviews and nest `direction: right` inside `boundary` groups.
  `pnpm build` output is not the place to discover this — preview the PNG.
- **Print proportions.** A printed figure must fit one page, so its height is capped
  near 230 mm. A diagram taller than about 1.5× its width shrinks to fit and its
  labels become hard to read on paper (below ~6 pt). Prefer wider, shorter layouts
  (`grid-columns`, side-by-side `boundary` groups), or split one tall figure into two.
- No paragraphs inside diagrams.
- Readers can click any figure to open it in a gallery (`<FigureGallery />`, built on
  yet-another-react-lightbox, loaded on first open): zoom, pan, fullscreen, and
  previous/next across the chapter's figures, in the reader's theme. The figure stays
  a plain link to the SVG for no-JS, middle-click, and modifier-click.

## Accessibility

- `alt` describes the flow in one or two sentences (what talks to what, in what order).
- For complex figures, the surrounding prose or `<Steps>` must convey the same
  information — the figure illustrates, it doesn't carry unique content.
- Light and dark variants must both meet WCAG AA contrast for text.

## Raster images

- Screenshots only when the real UI matters. Crop tightly; redact any real PII,
  hostnames, or tokens.
- Max 2400 px wide. Commit compressed WebP/AVIF; served as static files with
  lazy loading (no runtime image optimization).
- No stock photos, no decorative images, no AI-generated "hero art" in chapters.
