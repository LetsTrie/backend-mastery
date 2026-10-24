import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-4 font-body text-muted">
        This page doesn&apos;t exist. Chapters never move, so if you followed an old link, please
        let us know.
      </p>
      <p className="mt-6">
        <Link href="/chapters" className="link">
          Browse all chapters
        </Link>
      </p>
    </div>
  );
}
