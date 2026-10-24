import { readFileSync } from "node:fs";

export type Size = { width: number; height: number };

/** Intrinsic size of an SVG from its root `viewBox` (or width/height), so figures reserve space (no CLS). */
export function readSvgSize(filePath: string): Size | null {
  const head = readFileSync(filePath, "utf8").slice(0, 4096);
  const root = /<svg\b[^>]*>/.exec(head)?.[0];
  if (!root) return null;

  const viewBox = /viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/.exec(root);
  if (viewBox) return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };

  const width = /\bwidth="([\d.]+)(?:px)?"/.exec(root);
  const height = /\bheight="([\d.]+)(?:px)?"/.exec(root);
  if (width && height) return { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) };

  return null;
}
