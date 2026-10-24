import Link from "next/link";
import { Icon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="container-page flex max-w-2xl flex-col items-center py-28 text-center">
      <p className="font-display text-6xl font-semibold text-subtle">404</p>
      <h1 className="display mt-6 text-3xl">This page doesn&apos;t exist.</h1>
      <p className="lede mt-4">
        Chapters never move, so if you followed an old link, please let us know.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/chapters" className="btn btn-primary">
          Browse chapters
          <Icon name="arrowRight" size={17} />
        </Link>
        <Link href="/" className="btn btn-secondary">
          Home
        </Link>
      </div>
    </div>
  );
}
