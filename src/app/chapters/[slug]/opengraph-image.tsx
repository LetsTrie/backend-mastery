import { ImageResponse } from "next/og";
import { getChapter, getPart, getRoutableChapters } from "@/lib/content";
import { site } from "@/lib/site";

export const alt = "Chapter title card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getRoutableChapters().map((chapter) => ({ slug: chapter.slug }));
}

// Social cards are images, so colors are literal; they mirror the light tokens in tokens.css.
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const chapter = getChapter((await params).slug);
  const part = chapter ? getPart(chapter.part) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fbfaf7",
          color: "#1f1d1a",
          borderTop: "16px solid #a34a0b",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#5f5a52" }}>
          {part ? part.title : site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
            {chapter?.title ?? site.name}
          </div>
          <div style={{ fontSize: 34, color: "#5f5a52", lineHeight: 1.3 }}>
            {chapter?.subtitle ?? site.tagline}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>{site.name}</div>
      </div>
    ),
    size,
  );
}
