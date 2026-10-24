import { describe, expect, it } from "vitest";
import { analyzeMdx } from "./analyze";

describe("analyzeMdx", () => {
  it("assigns slug ids and honors explicit [#id] anchors", () => {
    const { toc } = analyzeMdx("## High-level design\n\n### Retries and backoff [#retry-with-backoff]\n\n## High-level design\n");
    expect(toc).toEqual([
      { depth: 2, id: "high-level-design", text: "High-level design" },
      { depth: 3, id: "retry-with-backoff", text: "Retries and backoff" },
      { depth: 2, id: "high-level-design-1", text: "High-level design" },
    ]);
  });

  it("numbers figures in document order", () => {
    const { figures, figRefs } = analyzeMdx(
      '<FigRef id="b" />\n\n<Figure id="a" src="./figures/a.svg" alt="A" caption="A" />\n\n<Figure id="b" src="./figures/b.svg" alt="B" caption="B" width="wide" />\n',
    );
    expect(figures.map((f) => [f.id, f.number, f.width])).toEqual([
      ["a", 1, "text"],
      ["b", 2, "wide"],
    ]);
    expect(figRefs.map((r) => r.id)).toEqual(["b"]);
  });

  it("deduplicates citations by href and numbers them by first use", () => {
    const { citations } = analyzeMdx(
      'One <Cite href="https://a.example" title="A" /> two <Cite href="https://b.example" title="B" /> again <Cite href="https://a.example" title="A" />.\n',
    );
    expect(citations.map((c) => [c.n, c.href])).toEqual([
      [1, "https://a.example"],
      [2, "https://b.example"],
    ]);
  });

  it("separates guidance comments from code expressions", () => {
    const { expressions } = analyzeMdx("{/* guidance */}\n\nValue: {1 + 1}\n");
    expect(expressions.map((e) => e.comment)).toEqual([true, false]);
  });

  it("counts prose words and finds TODO(verify) markers", () => {
    const result = analyzeMdx("One two three.\n\nTODO(verify): four five\n\n```ts\nignored code words\n```\n");
    expect(result.words).toBe(6);
    expect(result.todos).toEqual([{ text: "TODO(verify): four five", line: 3 }]);
  });
});
