import type { MetadataRoute } from "next";
import { getChapters, getParts } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = getChapters({ includeDrafts: false });
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/chapters") },
    { url: absoluteUrl("/glossary") },
    ...getParts().map((part) => ({ url: absoluteUrl(`/parts/${part.key}`) })),
    ...chapters.map((chapter) => ({
      url: absoluteUrl(`/chapters/${chapter.slug}`),
      lastModified: chapter.updated,
    })),
  ];
}
