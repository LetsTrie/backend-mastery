import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/ui/chapter-list";
import { getPart, getParts } from "@/lib/content";

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

  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <p className="text-sm text-muted">Part</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{part.title}</h1>
      <p className="mt-4 mb-10 font-body text-lg text-muted">{part.description}</p>
      <ChapterList chapters={part.items} />
    </div>
  );
}
