"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useUserStateStore } from "@/store/userState";
import {
  collapseFeed,
  isMoveEvent,
  isThoughtEvent,
} from "@/lib/audit";

import { EmptyState, NoticeShell } from "./_components/EmptyState";
import { Hero } from "./_components/Hero";
import { Tabs } from "./_components/Tabs";
import { Timeline } from "./_components/Timeline";
import { groupByDay } from "./_components/groupByDay";
import type { Tab } from "./_components/types";

/**
 * Dedicated activity log inspired by Giza Thoughts. Page-level glue
 * only — derive filtered rows + day groups + stats, then hand off to
 * `_components/Hero`, `Tabs`, `Timeline`, `EmptyState`.
 */
export default function ActivityPage() {
  const { isConnected } = useAccount();
  const audit = useUserStateStore((s) => s.audit);
  const [tab, setTab] = useState<Tab>("all");

  const rows = useMemo(() => collapseFeed(audit), [audit]);

  const stats = useMemo(() => {
    let t = 0;
    let m = 0;
    for (const r of rows) {
      if (isMoveEvent(r.event.event_type)) m += r.count;
      else if (isThoughtEvent(r.event.event_type)) t += r.count;
    }
    return { thoughts: t, moves: m };
  }, [rows]);

  const filtered = useMemo(() => {
    if (tab === "thoughts")
      return rows.filter((r) => isThoughtEvent(r.event.event_type));
    if (tab === "moves")
      return rows.filter((r) => isMoveEvent(r.event.event_type));
    return rows;
  }, [rows, tab]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  if (!isConnected) {
    return (
      <NoticeShell
        title="Connect a wallet"
        body="Connect to see what Compass has been thinking and doing on your behalf."
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-10 flex flex-col gap-8">
        <Hero stats={stats} />
        <Tabs current={tab} onChange={setTab} stats={stats} />
        {groups.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <Timeline groups={groups} />
        )}
      </div>
    </div>
  );
}
