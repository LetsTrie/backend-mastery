import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/ui/chapter-list";
import { getPart, getParts, getPlanned, partNumeral } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getParts().map((part) => ({ part: part.key }));
}

export async function generateMetadata({ params }: PageProps<"/parts/[part]">): Promise<Metadata> {
  const part = getPart((await params).part);
  if (!part) return {};
  return {
    title: part.title,
    description: part.description,
    alternates: { canonical: `/parts/${part.key}` },
  };
}

export default async function PartPage({ params }: PageProps<"/parts/[part]">) {
  const part = getPart((await params).part);
  if (!part) notFound();
  const planned = getPlanned(part);

  return (
    <div className="container-page max-w-4xl">
      <header className="pt-12 pb-8 sm:pt-16">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/chapters">Chapters</Link>
          <span aria-hidden="true">/</span>
          <span>Part {partNumeral(part.key)}</span>
        </nav>
        <p className="mt-8 font-display text-5xl font-semibold text-subtle">{partNumeral(part.key)}</p>
        <h1 className="display mt-3 text-4xl">{part.title}</h1>
        <p className="lede mt-5 max-w-2xl">{part.description}</p>
        <p className="mt-6 text-sm text-muted">
          {part.items.length} written · {planned.length} planned
        </p>
      </header>
      <ChapterList chapters={part.items} planned={planned} />
    </div>
  );
}
