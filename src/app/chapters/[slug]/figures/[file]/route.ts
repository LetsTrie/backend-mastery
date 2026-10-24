import { getChapter, getRoutableChapters, listFigureFiles, readFigureFile } from "@/lib/content";

// Figures live next to their chapter in content/ and are emitted as static files at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return getRoutableChapters().flatMap((chapter) =>
    listFigureFiles(chapter.folder).map((file) => ({ slug: chapter.slug, file })),
  );
}

export async function GET(_request: Request, ctx: RouteContext<"/chapters/[slug]/figures/[file]">) {
  const { slug, file } = await ctx.params;
  const chapter = getChapter(slug);
  const figure = chapter ? readFigureFile(chapter.folder, file) : null;
  if (!figure) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(figure.body), {
    headers: {
      "Content-Type": figure.contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
