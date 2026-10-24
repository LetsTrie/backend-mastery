import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { FigureUse } from "./analyze";
import { readSvgSize, type Size } from "./svg";

export const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

/** Files a chapter may serve from its `figures/` folder. */
export const figureFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.dark)?\.(svg|png|webp|avif|jpg)$/;

/** Editable sources that must sit next to a generated SVG. */
const svgSourceExtensions = [".d2", ".excalidraw", ".csv"];

export type ResolvedFigure = FigureUse & {
  url: string;
  darkUrl: string | null;
  size: Size | null;
  exists: boolean;
  hasSource: boolean;
};

export function figureUrl(slug: string, file: string) {
  return `/chapters/${slug}/figures/${file}`;
}

/** Resolves `./figures/x.svg` against the chapter folder: public URL, dark variant, size, source. */
export function resolveFigure(folder: string, slug: string, figure: FigureUse): ResolvedFigure {
  const relative = path.posix.normalize(figure.src);
  const file = path.posix.basename(relative);
  const absolute = path.join(CHAPTERS_DIR, folder, relative);
  const exists = relative.startsWith("figures/") && existsSync(absolute);
  const isSvg = file.endsWith(".svg");
  const stem = absolute.replace(/\.[a-z]+$/, "");
  const darkFile = isSvg ? file.replace(/\.svg$/, ".dark.svg") : null;
  const hasDark = darkFile !== null && existsSync(path.join(path.dirname(absolute), darkFile));

  return {
    ...figure,
    url: figureUrl(slug, file),
    darkUrl: hasDark && darkFile ? figureUrl(slug, darkFile) : null,
    size: exists && isSvg ? readSvgSize(absolute) : null,
    exists,
    hasSource: !isSvg || svgSourceExtensions.some((ext) => existsSync(stem + ext)),
  };
}

const contentTypes: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  jpg: "image/jpeg",
};

/** Servable files in a chapter's `figures/` folder. */
export function listFigureFiles(folder: string): string[] {
  const dir = path.join(CHAPTERS_DIR, folder, "figures");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((file) => figureFilePattern.test(file));
}

export function readFigureFile(folder: string, file: string) {
  if (!figureFilePattern.test(file)) return null;
  const absolute = path.join(CHAPTERS_DIR, folder, "figures", file);
  if (!existsSync(absolute)) return null;
  const extension = file.split(".").at(-1) ?? "";
  return { body: readFileSync(absolute), contentType: contentTypes[extension] ?? "application/octet-stream" };
}
