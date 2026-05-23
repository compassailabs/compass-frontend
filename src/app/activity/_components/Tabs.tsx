"use client";

import clsx from "clsx";

import type { Tab } from "./types";

/**
 * All / Thoughts / Moves filter strip. Each tab shows its current
 * matching event count next to the label so the user knows how many
 * items they'd see before clicking.
 */
export function Tabs({
  current,
  onChange,
  stats,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
  stats: { thoughts: number; moves: number };
}) {
  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: "all", label: "All", count: stats.thoughts + stats.moves },
    { id: "thoughts", label: "Thoughts", count: stats.thoughts },
    { id: "moves", label: "Moves", count: stats.moves },
  ];
  return (
    <div className="flex items-center gap-1 border-b border-line-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={clsx(
            "relative px-4 pb-3 text-[14px] font-medium transition-colors",
            current === t.id
              ? "text-silver-1"
              : "text-silver-4 hover:text-silver-2",
          )}
        >
          {t.label}
          {t.count !== null && (
            <span className="ml-1.5 font-mono text-[11px] text-silver-4">
              {t.count}
            </span>
          )}
          {current === t.id && (
            <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-silver-1" />
          )}
        </button>
      ))}
    </div>
  );
}
