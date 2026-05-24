import Link from "next/link";

import { Icon } from "@/components/visuals/Icon";
import type { Tab } from "./types";

export function EmptyState({ tab }: { tab: Tab }) {
  const lines: Record<Tab, { title: string; body: string }> = {
    all: {
      title: "No activity yet",
      body: "Once your strategy is committed, every check and move the engine makes will appear here.",
    },
    thoughts: {
      title: "No thoughts yet",
      body: "The engine's deliberations — evaluations, safety checks, policy changes — will show up here as soon as it runs.",
    },
    moves: {
      title: "No on-chain moves yet",
      body: "When the engine decides to rebalance, you'll see each transaction it sends, here.",
    },
  };
  const l = lines[tab];
  return (
    <div className="rounded-[18px] border border-line-2 bg-white/[0.03] p-10 text-center flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-line-2 grid place-items-center text-silver-3">
        <Icon name="clock" className="w-5 h-5" />
      </div>
      <h3 className="m-0 font-display text-[17px] text-silver-1">{l.title}</h3>
      <p className="m-0 text-[13px] text-silver-3 max-w-[380px] leading-[1.55]">
        {l.body}
      </p>
      <Link
        href="/chat"
        className="mt-2 font-mono text-[11px] text-silver-3 hover:text-silver-1 no-underline transition-colors"
      >
        Talk to Compass →
      </Link>
    </div>
  );
}

export function NoticeShell({ title, body }: { title: string; body: string }) {
  return (
    <div className="h-full grid place-items-center px-6 py-10">
      <div className="text-center max-w-[460px] flex flex-col gap-3 items-center">
        <h2 className="m-0 font-display text-[20px] font-semibold tracking-[-0.018em] text-silver-1">
          {title}
        </h2>
        <p className="m-0 text-[13.5px] text-silver-3 leading-[1.55]">{body}</p>
      </div>
    </div>
  );
}
