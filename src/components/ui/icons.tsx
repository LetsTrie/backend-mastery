import type { ReactNode, SVGProps } from "react";

/**
 * A small, consistent icon set: 24×24 grid, 1.75 stroke, round caps, currentColor.
 * Drawn for this site (no dependency). Icons are decorative unless given a label.
 */
const paths = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6Z" />,
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M8.5 20h7M12 16.5V20" />
    </>
  ),
  rss: (
    <>
      <path d="M5 11a8 8 0 0 1 8 8M5 4.5A14.5 14.5 0 0 1 19.5 19" />
      <circle cx="6" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  diagram: (
    <>
      <rect x="3" y="3.5" width="7" height="5" rx="1.25" />
      <rect x="14" y="3.5" width="7" height="5" rx="1.25" />
      <rect x="8.5" y="15.5" width="7" height="5" rx="1.25" />
      <path d="M6.5 8.5v2.5h11V8.5M12 11v4.5" />
    </>
  ),
  source: (
    <>
      <path d="M5 4.5h10.5l3.5 3.5v11.5H5z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 7.5h3" />
    </>
  ),
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  arrowLeft: <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />,
  arrowUp: <path d="M12 19.5v-15M6 10.5l6-6 6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  expand: <path d="M14.5 3.5h6v6M9.5 20.5h-6v-6M20.5 3.5l-6.5 6.5M3.5 20.5l6.5-6.5" />,
  note: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.9" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  tip: (
    <path d="M9.5 18.5h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2v.3h5V16c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" />
  ),
  warning: (
    <>
      <path d="M12 3.5 21 19.5H3z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  pitfall: (
    <>
      <path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </>
  ),
  interview: (
    <>
      <path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  estimate: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <rect x="8" y="6" width="8" height="3.5" rx="0.75" />
      <path d="M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01M15.5 17h.01" strokeWidth="2.25" />
    </>
  ),
  tradeoffs: (
    <>
      <path d="M12 4v16M7 20h10M5 7.5h14" />
      <path d="M5 7.5 2.5 13h5zM19 7.5 16.5 13h5z" />
    </>
  ),
  check: <path d="M5 12.5 9.5 17 19 7" />,
  book: (
    <>
      <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12.5v15H7a2.5 2.5 0 0 0-2.5 2.5z" />
      <path d="M4.5 20.5A2.5 2.5 0 0 1 7 18h12.5v3H7" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M9.5 4v16" />
    </>
  ),
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  shield: <path d="M12 3 19.5 6v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" />,
  layers: (
    <>
      <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 18,
  label,
  ...props
}: { name: IconName; size?: number; label?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

/** The Backend Mastery mark: a "B" monogram, matching the favicon (src/app/icon.svg). */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="logo-mark"
    >
      <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
      <path
        d="M10 6.5h7.5a4.75 4.75 0 0 1 0 9.5H10zm0 9.5h8.5a4.75 4.75 0 0 1 0 9.5H10z"
        fill="none"
        stroke="var(--color-accent-contrast)"
        strokeWidth="2.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
