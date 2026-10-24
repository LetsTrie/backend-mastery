# 0003. Diagrams as code with D2

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

System design chapters live or die by their diagrams: 8–15 per chapter, many
of them evolving versions of the same architecture. Diagrams must look
consistent across years of chapters, support light and dark themes, and be
editable by anyone — not just whoever owns the original design file.

## Decision

- Architecture, sequence, ER, and state diagrams are written in **D2** and
  committed as source (`<id>.d2`) next to generated `<id>.svg` and
  `<id>.dark.svg`.
- A shared `content/_shared/d2/base.d2` defines the visual language (node
  classes, edge classes, layout engine). Chapter diagrams use classes only.
- `scripts/render-diagrams.sh` renders; `--check` fails CI on stale SVGs.
- Generated SVGs are committed so the site build doesn't need D2 installed and
  diffs show visual changes in review.

## Alternatives considered

| Option         | Pros                                 | Cons                                                     |
| -------------- | ------------------------------------ | -------------------------------------------------------- |
| Mermaid        | Ubiquitous, renders on GitHub         | Weak layout control for large architectures; inconsistent styling |
| Excalidraw     | Beautiful, friendly                   | Manual layout; restyling every diagram is manual work     |
| Figma / draw.io| Full control                          | Binary-ish sources, hard to review, depends on one editor |
| PlantUML       | Mature                                 | Dated look; Java dependency                              |

Excalidraw remains allowed for rare hand-drawn conceptual sketches.

## Consequences

- Restyling every diagram in the book = editing one file and re-rendering.
- Contributors need `d2` installed locally (`brew install d2`) to change figures.
- Diagram review happens in PRs on both source and SVG diff.
