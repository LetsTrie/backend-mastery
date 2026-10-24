import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icons";
import type { ResolvedFigure } from "@/lib/content";
import { InlineText } from "./inline-text";

/**
 * Numbered, captioned figure. Props come from MDX (`id`, `src`, `alt`, `caption`, `width`);
 * number, URLs, dark variant, and intrinsic size are resolved at build time and bound per chapter.
 */
export function Figure({ figure }: { figure: ResolvedFigure | undefined }) {
  if (!figure) return <div className="figure-missing">Unknown figure</div>;
  const anchor = `fig-${figure.id}`;
  const size = figure.size ?? undefined;
  // Intrinsic size, used by the print stylesheet to scale every diagram consistently.
  const printSize = size ? ({ "--fig-w": size.width, "--fig-h": size.height } as CSSProperties) : undefined;

  return (
    <figure id={anchor} className="figure" data-width={figure.width} style={printSize}>
      <div className="figure-media">
        {figure.exists ? (
          <>
            <a href={figure.url} className="figure-img figure-img--light" title="Open full size">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG diagrams need no optimization */}
              <img
                src={figure.url}
                alt={figure.alt}
                width={size?.width}
                height={size?.height}
                loading="lazy"
                decoding="async"
              />
            </a>
            {figure.darkUrl ? (
              <a
                href={figure.darkUrl}
                className="figure-img figure-img--dark"
                title="Open full size"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={figure.darkUrl}
                  alt={figure.alt}
                  width={size?.width}
                  height={size?.height}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ) : null}
          </>
        ) : (
          <p className="figure-missing">Missing figure file: {figure.src}</p>
        )}
        {figure.exists ? (
          <span className="figure-zoom print-hide" aria-hidden="true">
            <Icon name="expand" size={15} />
          </span>
        ) : null}
      </div>
      <figcaption>
        <a className="figure-label" href={`#${anchor}`}>
          Figure {figure.number}
        </a>
        <InlineText text={figure.caption} />
      </figcaption>
    </figure>
  );
}

/** "Figure N" cross-reference link. */
export function FigRef({ figure, id }: { figure: ResolvedFigure | undefined; id: string }) {
  if (!figure) return <span className="figref figref--missing">Figure ? ({id})</span>;
  return (
    <a className="figref" href={`#fig-${figure.id}`}>
      Figure {figure.number}
    </a>
  );
}
