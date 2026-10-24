import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="container-page max-w-4xl">
      <header className="pt-12 pb-8 sm:pt-16">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/chapters">Chapters</Link>
          <span aria-hidden="true">/</span>
          <span>Topic</span>
        </nav>
        <h1 className="display mt-8 text-4xl">
          <span className="text-subtle">#</span>
          {tag}
        </h1>
        <p className="mt-4 text-muted">
          {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
        </p>
      </header>
      <ChapterList chapters={chapters} />
    </div>
  );
}
