---
paths:
  - "content/**"
  - "src/components/mdx/**"
---

# MDX component catalog

This catalog is the **public API between writers and the site**. Content may use
only these components plus standard Markdown. Components live in
`src/components/mdx/` and are registered in `src/components/mdx/index.ts`.

## Stability contract

- A component's name and props are **never removed or renamed**. Old chapters
  must keep rendering forever.
- Add optional props freely. To replace a prop, support both and mark the old
  one `@deprecated` in TSDoc; migrate content; only then consider removal (ADR).
- New components need: a TSDoc block, an entry in this file, and a usage in
  `content/chapters/_template/index.mdx` or a fixture.
- Components must render meaningfully **without JavaScript** (Server
  Components; progressive enhancement for anything interactive).
- Every component must degrade into readable text if the content is exported
  to plain Markdown (keep children as real text, not props-only).

---

## Catalog

### `<KeyTakeaways>`
Opening summary box. 3–5 bullets, each a full sentence.
```mdx
<KeyTakeaways>
- Decouple producers from channels with a queue per channel.
- …
</KeyTakeaways>
```

### `<Figure>` and `<FigRef>`
All images and diagrams. Auto-numbered in document order ("Figure 3").
```mdx
<Figure
  id="high-level-design"
  src="./figures/high-level-design.svg"
  alt="Clients call the Notification API, which writes to per-channel queues consumed by push, email, and SMS workers."
  caption="High-level design. Numbers match the walkthrough below."
  width="wide"
/>

As <FigRef id="high-level-design" /> shows, …
```
- `id`: kebab-case, unique within the chapter, **permanent** (it's an anchor: `#fig-high-level-design`).
- `src`: relative to the chapter. For D2 figures point at the light `.svg`; the
  component picks up `<id>.dark.svg` automatically.
- `alt`: describes *what the diagram shows* (components and flow), not "diagram of system". Required.
- `caption`: one or two sentences; plain text plus `inline code` (no other Markdown).
- `width`: `text` (default) | `wide` | `full`. Architecture overviews use `wide`.
- `<FigRef>` renders "Figure N" as a link. A dangling id fails content lint.

### `<Callout>`
```mdx
<Callout type="tip" title="Optional title">Body in Markdown.</Callout>
```
`type`: `note` | `tip` | `warning` | `pitfall` | `interview`.
`interview` = "how this comes up in a design interview". Max ~1 callout per 800 words.

### `<Estimate>`
Back-of-the-envelope tables. Shows assumption, formula, result.
```mdx
<Estimate title="Traffic">
| Quantity          | Formula                     | Result        |
| ----------------- | --------------------------- | ------------- |
| Daily sends       | 10M DAU × 5 / user          | 50M / day     |
| Average QPS       | 50M ÷ 86,400 s              | ≈ 580 QPS     |
| Peak QPS (×5)     | 580 × 5                     | ≈ 2.9k QPS    |
</Estimate>
```
Assumptions go in a preceding bolded **Assumption:** list, not hidden in the table.

### `<Tradeoffs>`
Decision record table. Columns are fixed.
```mdx
<Tradeoffs>
| Decision          | Chosen               | Alternative            | Why                                       |
| ----------------- | -------------------- | ---------------------- | ----------------------------------------- |
| Delivery semantics| At-least-once + dedup| Exactly-once           | Cheaper; dedup by idempotency key is enough |
</Tradeoffs>
```

### `<Term>`
Glossary link with hover/focus definition from `content/glossary.yml`.
```mdx
<Term id="idempotency-key">idempotency key</Term>
```
Use on the **first** occurrence per chapter only.

### `<Cite>`
Inline citation; collected into the References section automatically.
```mdx
Apple caps payload size at 4 KB <Cite href="https://developer.apple.com/…" title="APNs: Sending notification requests" />.
```
`href` and `title` required; `author`, `year` optional. Must be a real, reachable URL.

### `<Steps>`
Numbered walkthrough tied to a figure's ①②③ markers.
```mdx
<Steps>
1. The client calls `POST /v1/notifications`.
2. …
</Steps>
```

### `<Tabs>` / `<Tab>`
Alternative views of the same thing (e.g. SQL vs. NoSQL schema). Not for hiding
important content — the first tab must be sufficient on its own.
```mdx
<Tabs>
  <Tab label="Relational">…</Tab>
  <Tab label="Wide-column">…</Tab>
</Tabs>
```

### `<Aside>`
Tangential but interesting; renders in the margin on wide screens, inline on
mobile. Must not contain anything required to follow the main text.

---

## Not allowed in content

- Raw HTML tags (`<div>`, `<br>`, `<img>`, `<span style>`).
- `import` / `export` statements in MDX (components are injected globally).
- Arbitrary JSX expressions (`{someVar}`), except within component props and
  `{/* comments */}` (guidance comments; remove them before review).
- Images via Markdown `![]()` — use `<Figure>` so every image is numbered and captioned.
