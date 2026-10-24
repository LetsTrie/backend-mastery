import type { Metadata } from "next";
import Link from "next/link";
import { getChapter, getGlossary } from "@/lib/content";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Definitions of the terms used throughout the book, with links to where each is explained in depth.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Glossary</h1>
      <dl className="mt-10 divide-y divide-border border-y border-border">
        {getGlossary().map((entry) => {
          const owner = entry.owner ? getChapter(entry.owner) : undefined;
          return (
            <div key={entry.id} id={entry.id} className="scroll-mt-20 py-5">
              <dt className="font-semibold">
                <a href={`#${entry.id}`} className="hover:text-accent">
                  {entry.term}
                </a>
              </dt>
              <dd className="mt-1 font-body text-muted">
                {entry.definition}
                {owner ? (
                  <>
                    {" "}
                    <Link href={`/chapters/${owner.slug}`} className="link">
                      Read: {owner.title}
                    </Link>
                  </>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
