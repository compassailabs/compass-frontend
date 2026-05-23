import type { FeedRow } from "@/lib/audit";

export type DayGroup = { date: string; label: string; rows: FeedRow[] };

/**
 * Walk the (already newest-first) collapsed feed, breaking on calendar
 * day boundaries. Labels "Today" / "Yesterday" / "Wed, May 21" based
 * on the user's local timezone so the rail reads naturally.
 */
export function groupByDay(rows: FeedRow[]): DayGroup[] {
  const out: DayGroup[] = [];
  const today = startOfDay(new Date());
  const yesterday = new Date(today.getTime() - 24 * 3600 * 1000);

  let current: DayGroup | null = null;
  for (const r of rows) {
    const d = startOfDay(new Date(r.event.ts));
    const key = d.toISOString().slice(0, 10);
    if (!current || current.date !== key) {
      let label: string;
      if (d.getTime() === today.getTime()) label = "Today";
      else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
      else
        label = d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      current = { date: key, label, rows: [] };
      out.push(current);
    }
    current.rows.push(r);
  }
  return out;
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}
