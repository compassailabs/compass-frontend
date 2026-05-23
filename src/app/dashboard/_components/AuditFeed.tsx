import Link from "next/link";
import clsx from "clsx";

import type { AuditEvent } from "@/lib/api";
import { collapseFeed, eventTypeLabel, summarizeAudit, type FeedRow } from "@/lib/audit";
import { txExplorerUrl } from "@/lib/explorers";
import { timeAgo } from "@/lib/format";

/**
 * Dashboard "Recent activity" peek — shows the most recent N collapsed
 * feed rows with a link to the full /activity timeline. The full
 * audit feed (with day grouping + tab filters) lives on the dedicated
 * Activity page; this is just a glance.
 */
const FEED_LIMIT = 5;

export function AuditFeed({ events }: { events: AuditEvent[] }) {
  const rows = collapseFeed(events);
  const visible = rows.slice(0, FEED_LIMIT);
  return (
    <section className="rounded-[18px] border border-line-2 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          Recent activity
        </span>
        <Link
          href="/activity"
          className="font-mono text-[10px] tracking-[0.06em] text-silver-3 hover:text-silver-1 transition-colors no-underline"
        >
          View all →
        </Link>
      </header>
      {visible.length === 0 ? (
        <div className="text-[12px] text-silver-4">
          No automation activity yet. The engine ticks every 15 minutes by
          default.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((r) => (
            <AuditRow key={r.event.id} row={r} />
          ))}
        </ul>
      )}
      {rows.length > visible.length && (
        <Link
          href="/activity"
          className="self-start mt-1 font-mono text-[10px] tracking-[0.06em] text-silver-3 hover:text-silver-1 transition-colors no-underline"
        >
          + {rows.length - visible.length} more on activity log →
        </Link>
      )}
    </section>
  );
}

function AuditRow({ row }: { row: FeedRow }) {
  const { event, count, oldestTs } = row;
  const { label, accent } = summarizeAudit(event);
  const explorer = txExplorerUrl(event.chain, event.tx_hash);
  return (
    <li className="grid grid-cols-[1fr_auto] gap-2 items-baseline text-[12px] py-1 border-b border-line-1 last:border-b-0">
      <div className="min-w-0">
        <span
          className={clsx(
            "font-mono text-[10px] tracking-[0.1em] uppercase mr-2",
            accent,
          )}
        >
          {eventTypeLabel(event.event_type)}
        </span>
        <span className="text-silver-2">{label}</span>
        {count > 1 && (
          <span className="ml-1.5 font-mono text-[10px] text-silver-4">
            × {count} since {timeAgo(oldestTs)}
          </span>
        )}
        {explorer && (
          <a
            href={explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-mono text-[10px] text-silver-4 hover:text-silver-1 underline decoration-line-2 underline-offset-2"
          >
            ↗
          </a>
        )}
      </div>
      <span className="font-mono text-[10px] text-silver-4 whitespace-nowrap">
        {timeAgo(event.ts)}
      </span>
    </li>
  );
}
