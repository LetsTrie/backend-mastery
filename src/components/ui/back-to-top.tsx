import { Icon } from "./icons";

/**
 * Floating "back to top" control. A plain link (no JS): it appears once the reader has
 * scrolled about a screen, via a scroll-driven animation; browsers without one always show it.
 */
export function BackToTop() {
  return (
    <a href="#main" className="back-to-top print-hide" aria-label="Back to top">
      <Icon name="arrowUp" size={18} />
    </a>
  );
}
