import type { TocItem } from "@/lib/content";
import { Icon } from "./icons";
import { TocSpy } from "./toc-spy";
import { TocToggle } from "./toc-toggle";

type TocGroup = { item: TocItem; children: TocItem[] };

/** Nests each `###` under its `##`, so a section's sub-items can show only while it is active. */
function group(items: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (item.depth > 2 && last) last.children.push(item);
    else groups.push({ item, children: [] });
  }
  return groups;
}

function TocLink({ item }: { item: TocItem }) {
  return (
    <a href={`#${item.id}`} data-toc-id={item.id}>
      {item.text}
    </a>
  );
}

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul>
      {group(items).map(({ item, children }) => (
        <li key={item.id} data-depth={item.depth}>
          <TocLink item={item} />
          {children.length > 0 ? (
            <ul className="toc-sub">
              {children.map((child) => (
                <li key={child.id} data-depth={child.depth}>
                  <TocLink item={child} />
                </li>
              ))}
            </ul>
          ) : null}
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
