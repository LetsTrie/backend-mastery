import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { analyzeMdx } from "./analyze";
import { MDX_COMPONENTS } from "./catalog";
import { citationDefinitions, mdxToMarkdownTree, stringifyMarkdown, type MarkdownContext } from "./markdown";

const source = `{/* guidance comment */}

<KeyTakeaways>
- Accept fast, deliver later.
</KeyTakeaways>

## Retries and backoff [#retry-with-backoff]

See <FigRef id="hld" /> and the <Term id="ttl">TTL</Term> rules <Cite href="https://example.com/a" title="Source A" author="Ada" year="2024" />.

<Figure id="hld" src="./figures/hld.svg" alt="Clients call the API." caption="The \`API\` layer." width="wide" />

<Callout type="interview">Say the number out loud.</Callout>

<Estimate title="Traffic">
| Quantity | Result |
| -------- | ------ |
| Peak     | 58k    |
</Estimate>

<Tabs>
  <Tab label="SQL">

\`\`\`sql title="schema.sql"
SELECT 1;
\`\`\`

  </Tab>
</Tabs>

<Aside>A tangent.</Aside>

[Inbox](#inbox) and [another chapter](/chapters/idempotency).
`;

function render(mdx: string) {
  const analysis = analyzeMdx(mdx);
  const ctx: MarkdownContext = {
    chapterUrl: "https://bm.example/chapters/x",
    origin: "https://bm.example",
    figures: analysis.figures.map((f) => ({ ...f, url: `/chapters/x/figures/${f.id}.svg` })),
    citations: analysis.citations,
  };
  const nodes = [...mdxToMarkdownTree(mdx, ctx), ...citationDefinitions(analysis.citations)];
  return stringifyMarkdown({ type: "root", children: nodes } as Root);
}

describe("mdx → portable markdown", () => {
  const md = render(source);

  it("contains no JSX or MDX comments", () => {
    expect(md).not.toMatch(/<\/?[A-Z]/);
    expect(md).not.toContain("guidance comment");
  });

  it("strips explicit anchor ids from headings", () => {
    expect(md).toContain("## Retries and backoff\n");
    expect(md).not.toContain("[#retry-with-backoff]");
  });

  it("renders figures as absolute images with numbered captions", () => {
    expect(md).toContain("![Clients call the API.](https://bm.example/chapters/x/figures/hld.svg)");
    expect(md).toContain("*Figure 1. The `API` layer.*");
    expect(md).toContain("See Figure 1 and the TTL rules");
  });

  it("turns citations into GFM footnotes", () => {
    expect(md).toContain("rules[^1].");
    expect(md).toContain("[^1]: Ada. [Source A](https://example.com/a). 2024.");
  });

  it("keeps callouts, asides, estimates, and tabs readable", () => {
    expect(md).toContain("> **In the interview.** Say the number out loud.");
    expect(md).toContain("> **Aside.** A tangent.");
    expect(md).toContain("**Estimate: Traffic**");
    expect(md).toMatch(/\| Peak +\| 58k +\|/);
    expect(md).toContain("**SQL**");
    expect(md).toContain('```sql title="schema.sql"');
    expect(md).toContain("## Key takeaways");
  });

  it("makes links absolute", () => {
    expect(md).toContain("[Inbox](https://bm.example/chapters/x#inbox)");
    expect(md).toContain("[another chapter](https://bm.example/chapters/idempotency)");
  });

  it("has an export mapping for every catalog component", () => {
    for (const name of MDX_COMPONENTS) {
      const sample = `<${name} id="hld" label="L" title="T" href="https://example.com/a">body text</${name}>\n`;
      const out = render(`<Figure id="hld" src="./figures/hld.svg" alt="a" caption="c" />\n\n${sample}`);
      expect(out, name).not.toMatch(new RegExp(`<${name}`));
    }
  });
});
