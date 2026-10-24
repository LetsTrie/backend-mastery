import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-ui text-sm font-semibold tracking-tight whitespace-nowrap">
          {site.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm">
          <Link href="/chapters" className="text-muted hover:text-text">
            Chapters
          </Link>
          <Link href="/glossary" className="text-muted hover:text-text">
            Glossary
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
