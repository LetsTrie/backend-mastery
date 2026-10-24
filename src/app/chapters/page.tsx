import type { Metadata } from "next";
import Link from "next/link";
import { ChapterList } from "@/components/ui/chapter-list";
import { getParts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Every chapter, in reading order: foundations, building blocks, and case studies.",
  alternates: { canonical: "/chapters" },
};

export default function ChaptersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Chapters</h1>
      {getParts().map((part) => (
        <section key={part.key} className="mt-14" aria-labelledby={`part-${part.key}`}>
          <h2 id={`part-${part.key}`} className="text-xl font-semibold">
            <Link href={`/parts/${part.key}`} className="hover:text-accent">
              {part.title}
            </Link>
          </h2>
          <p className="mt-1 mb-5 font-body text-muted">{part.description}</p>
          <ChapterList chapters={part.items} />
        </section>
      ))}
    </div>
  );
}
