import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readSvgSize } from "./svg";

function svg(markup: string) {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "svg-")), "x.svg");
  writeFileSync(file, markup);
  return file;
}

describe("readSvgSize", () => {
  it("reads the viewBox", () => {
    expect(readSvgSize(svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4172 1026"></svg>'))).toEqual({ width: 4172, height: 1026 });
  });
  it("falls back to width/height", () => {
    expect(readSvgSize(svg('<svg width="300px" height="150"></svg>'))).toEqual({ width: 300, height: 150 });
  });
});
