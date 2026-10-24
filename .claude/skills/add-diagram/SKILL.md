---
name: add-diagram
description: Create or update a D2 diagram for a chapter using the shared visual language, render light/dark SVGs, and insert the <Figure> into the chapter. Use when a chapter needs an architecture, sequence, data-flow, ER, or state diagram.
argument-hint: <slug> <figure-id> <what the diagram should show>
---

# Add diagram: $ARGUMENTS

Read `.claude/rules/diagrams-and-figures.md` and
`content/_shared/d2/base.d2` first. The shared classes are the only styling
allowed.

## Steps

1. **Decide the figure**: one idea, ≤ 12 nodes (overviews ≤ ~18 with
   `boundary` groups). Pick the type: architecture, sequence
   (`shape: sequence_diagram`), ER (`shape: sql_table`), or state.
   Use names that match the chapter prose exactly.
2. **Write the source** at
   `content/chapters/<slug>/figures/<figure-id>.d2`:

   ```d2
   ...@../../../_shared/d2/base

   direction: right

   client: Mobile app {class: client}
   api: Notification API {class: service}
   q: Push queue {class: queue}
   worker: Push worker {class: service}
   apns: APNs {class: external}

   client -> api: "① POST /notifications"
   api -> q: "② enqueue" {class: async}
   q -> worker: "③ consume" {class: async}
   worker -> apns: "④ send"
   ```

   - Solid = sync, `class: async` = async, `class: failure` = error path.
   - `class: focus` on the one area a deep dive is about (max one per figure).
   - If evolving an earlier figure, keep node keys and positions consistent.
3. **Render**: `scripts/render-diagrams.sh content/chapters/<slug>/figures/<figure-id>.d2`
   (requires `brew install d2`). This writes `<figure-id>.svg` and
   `<figure-id>.dark.svg`. Never hand-edit the SVGs.
4. **Look at it**: render a PNG preview into the scratchpad
   (`d2 <file>.d2 <scratchpad>/<figure-id>.png`), view it, and check for
   overlaps, crossing edges, and unreadable labels. Iterate on the source —
   reorder declarations, add `boundary` containers, or change `direction` —
   until it's clean.
5. **Insert** into the chapter where it belongs:

   ```mdx
   <Figure
     id="<figure-id>"
     src="./figures/<figure-id>.svg"
     alt="<one or two sentences describing what talks to what, in order>"
     caption="<what the reader should notice>"
     width="wide"
   />
   ```

   and reference it from the prose with `<FigRef id="<figure-id>" />`. If the
   figure has ①②③ steps, add a matching `<Steps>` list.
6. Report the figure id, its path, and anything you'd still improve.
