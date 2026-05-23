import clsx from "clsx";

import { eventTypeLabel, summarizeAudit, type FeedRow } from "@/lib/audit";
import { txExplorerUrl } from "@/lib/explorers";
import { timeAgo } from "@/lib/format";

import type { DayGroup } from "./groupByDay";

/**
 * Left date rail + right activity rows, grouped by calendar day.
 */
export function Timeline({ groups }: { groups: DayGroup[] }) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => (
        <DayBlock key={g.date} group={g} />
      ))}
    </div>
  );
}

function DayBlock({ group }: { group: DayGroup }) {
  return (
    <section className="grid grid-cols-[140px_1fr] gap-6 md:gap-10 py-4">
      <aside className="pt-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-silver-1" />
          <span className="font-display text-[15px] text-silver-1 leading-none">
            {group.label}
          </span>
        </div>
        <div className="ml-[14px] mt-1.5 font-mono text-[11px] text-silver-4">
          {group.rows.length} item{group.rows.length === 1 ? "" : "s"}
        </div>
      </aside>
      <div className="flex flex-col">
        {group.rows.map((r) => (
          <ActivityRow key={r.event.id} row={r} />
        ))}
      </div>
    </section>
  );
}

function ActivityRow({ row }: { row: FeedRow }) {
  const { event, count, oldestTs } = row;
  const { label, accent } = summarizeAudit(event);
  const explorer = txExplorerUrl(event.chain, event.tx_hash);
  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 py-4 border-b border-line-1 last:border-b-0">
      <div className="flex flex-col gap-2 min-w-0">
        <span
          className={clsx(
            "font-mono text-[10px] tracking-[0.14em] uppercase",
            accent,
          )}
        >
          {eventTypeLabel(event.event_type)}
        </span>
        <div className="text-[14px] text-silver-1 leading-[1.55]">
          {label}
          {count > 1 && (
            <span className="ml-2 font-mono text-[11px] text-silver-4">
              × {count} since {timeAgo(oldestTs)}
            </span>
          )}
          {explorer && (
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 font-mono text-[11px] text-silver-4 hover:text-silver-1 underline decoration-line-2 underline-offset-2"
            >
              ↗
            </a>
          )}
        </div>
      </div>
      <span className="font-mono text-[11px] text-silver-4 whitespace-nowrap pt-[2px]">
        {timeAgo(event.ts)}
      </span>
    </div>
  );
}
