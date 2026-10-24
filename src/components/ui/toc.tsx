import type { TocItem } from "@/lib/content";
import { Icon } from "./icons";
import { TocSpy } from "./toc-spy";
import { TocToggle } from "./toc-toggle";

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} data-depth={item.depth}>
          <a href={`#${item.id}`} data-toc-id={item.id}>
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Sticky left rail on wide screens, with scroll-spy. Collapsible to a single toggle button. */
export function TocRail({ items }: { items: TocItem[] }) {
  return (
    <nav className="toc" aria-label="On this page">
      <div className="toc-head">
        <p className="toc-title">
          <Icon name="list" size={15} />
          On this page
        </p>
        <TocToggle controls="toc-panel" />
      </div>
      <div id="toc-panel" className="toc-panel">
        <TocList items={items} />
        <a href="#main" className="toc-top">
          <Icon name="arrowUp" size={14} />
          Back to top
        </a>
      </div>
      <TocSpy ids={items.map((item) => item.id)} />
    </nav>
  );
}

/** Collapsible "On this page" at the top of the chapter on smaller screens. Works without JS. */
export function TocInline({ items }: { items: TocItem[] }) {
  return (
    <details className="toc-inline">
      <summary>
        <Icon name="list" size={16} />
        On this page
      </summary>
      <nav className="toc" aria-label="On this page (collapsible)">
        <TocList items={items} />
      </nav>
    </details>
  );
}
