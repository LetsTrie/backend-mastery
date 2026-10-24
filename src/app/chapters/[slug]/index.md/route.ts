import { getChapter, getRoutableChapters } from "@/lib/content";
import { chapterMarkdown } from "@/lib/llm";

// Served at /chapters/<slug>.md via a rewrite in next.config.ts (and at this path directly).
export const dynamicParams = false;

export function generateStaticParams() {
  return getRoutableChapters().map((chapter) => ({ slug: chapter.slug }));
}

export async function GET(_request: Request, ctx: RouteContext<"/chapters/[slug]/index.md">) {
  const chapter = getChapter((await ctx.params).slug);
  if (!chapter) return new Response("Not found", { status: 404 });

  return new Response(chapterMarkdown(chapter), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": "inline",
      "X-Robots-Tag": chapter.status === "published" ? "all" : "noindex",
    },
  });
}
