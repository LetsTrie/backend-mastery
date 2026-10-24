import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/ui/chapter-list";
import { getTags } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getTags().keys()].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Tagged “${tag}”`, alternates: { canonical: `/tags/${tag}` } };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const { tag } = await params;
  const chapters = getTags().get(tag);
  if (!chapters) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <p className="text-sm text-muted">Tag</p>
      <h1 className="mt-1 mb-10 text-3xl font-semibold tracking-tight">{tag}</h1>
      <ChapterList chapters={chapters} />
    </div>
  );
}
