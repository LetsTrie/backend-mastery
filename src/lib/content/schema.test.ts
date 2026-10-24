import { describe, expect, it } from "vitest";
import { chapterSchema } from "./schema";

const base = {
  slug: "design-a-rate-limiter",
  kind: "case-study",
  title: "Design a rate limiter",
  subtitle: "Token buckets, sliding windows, and distributed counters",
  description:
    "How to design a distributed rate limiter: algorithms, where to enforce limits, how to share counters across nodes, and what happens when Redis is down.",
  part: "case-studies",
  status: "draft",
  updated: "2026-11-01",
};

describe("chapterSchema", () => {
  it("accepts a valid draft and fills defaults", () => {
    const result = chapterSchema.parse(base);
    expect(result.tags).toEqual([]);
    expect(result.aliases).toEqual([]);
  });

  it("normalizes YAML Date values to ISO dates", () => {
    expect(chapterSchema.parse({ ...base, updated: new Date("2026-11-01") }).updated).toBe("2026-11-01");
  });

  it("requires a published date and an author once published", () => {
    const result = chapterSchema.safeParse({ ...base, status: "published" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual(["authors", "published"]);
  });

  it("rejects descriptions outside 120–160 characters", () => {
    expect(chapterSchema.safeParse({ ...base, description: "Too short." }).success).toBe(false);
  });

  it("keeps fixtures in draft", () => {
    expect(chapterSchema.safeParse({ ...base, slug: "_fixture", status: "review" }).success).toBe(false);
  });
});
