import Link from "next/link";
import type { ComponentProps } from "react";

function heading(Tag: "h2" | "h3" | "h4") {
  function Heading({ id, children, ...props }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...props}>
        {children}
        {id ? (
          <a className="heading-anchor" href={`#${id}`}>
            <span aria-hidden="true">#</span>
            <span className="sr-only">Link to this section</span>
          </a>
        ) : null}
      </Tag>
    );
  }
  Heading.displayName = Tag;
  return Heading;
}

export const H2 = heading("h2");
export const H3 = heading("h3");
export const H4 = heading("h4");

/** Internal links use client-side navigation; external links open in the same tab. */
export function Anchor({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  return <a href={href} {...props} />;
}

/** Tables scroll horizontally on small screens and are reachable by keyboard. */
export function Table(props: ComponentProps<"table">) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  );
}
