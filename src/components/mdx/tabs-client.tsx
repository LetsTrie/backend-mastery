"use client";

import { useId, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

const noop = () => () => {};

export function TabsClient({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  if (!hydrated) {
    return (
      <div className="tabs">
        {tabs.map((tab) => (
          <section key={tab.label} className="tabs-panel">
            <p className="tabs-static-label">{tab.label}</p>
            {tab.content}
          </section>
        ))}
      </div>
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <div className="tabs">
      <div role="tablist" className="tabs-list" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            className="tabs-tab"
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.label}
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          className="tabs-panel"
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
