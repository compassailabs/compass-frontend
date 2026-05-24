"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import type { ToolTrace } from "@/lib/api";

const WRITE_TOOLS = new Set(["commit_policy", "pause_policy", "resume_policy"]);

const TOOL_LABELS: Record<string, { done: string; pending: string }> = {
  load_skill:    { done: "Load reference",  pending: "Loading reference…" },
  check_balance: { done: "Check balance",   pending: "Checking balance…" },
  read_market:   { done: "Read market",     pending: "Reading market…" },
  read_position: { done: "Check position",  pending: "Checking position…" },
  read_policy:   { done: "Read policy",     pending: "Reading policy…" },
  read_audit:    { done: "View history",    pending: "Loading history…" },
  commit_policy: { done: "Update policy",   pending: "Updating policy…" },
  pause_policy:  { done: "Pause engine",    pending: "Pausing engine…" },
  resume_policy: { done: "Resume engine",   pending: "Resuming engine…" },
};

const WRITE_SUMMARY: Record<string, string> = {
  commit_policy: "updated policy",
  pause_policy:  "paused engine",
  resume_policy: "resumed engine",
};

function labelFor(name: string, pending: boolean): string {
  const entry = TOOL_LABELS[name];
  if (entry) return pending ? entry.pending : entry.done;
  return pending ? `${name}…` : name;
}

function summarize(trace: ToolTrace[]): string {
  const writes = trace.filter((t) => WRITE_SUMMARY[t.name]);
  const reads = trace.filter((t) => !WRITE_SUMMARY[t.name]);

  const parts: string[] = [];
  if (reads.length > 0) {
    parts.push(`Checked ${reads.length} thing${reads.length === 1 ? "" : "s"}`);
  }
  for (const w of writes) {
    parts.push(WRITE_SUMMARY[w.name]);
  }

  if (parts.length === 0) return "No actions";
  const joined = parts.join(", ");
  return joined[0].toUpperCase() + joined.slice(1);
}

export function ToolChips({ trace }: { trace: ToolTrace[] }) {
  const [expanded, setExpanded] = useState(false);

  const isWorking = trace.some((t) => t.output === "(pending…)");
  const pending = trace.find((t) => t.output === "(pending…)");

  const [frozen, setFrozen] = useState<ToolTrace[] | null>(null);
  const wasWorking = useRef(false);
  useEffect(() => {
    if (isWorking) {
      wasWorking.current = true;
    } else if (wasWorking.current && trace.length > 0 && !frozen) {
      setFrozen([...trace]);
    }
  }, [isWorking, trace, frozen]);

  const displayTrace = frozen ?? trace;
  const headerText = isWorking && pending
    ? labelFor(pending.name, true)
    : summarize(displayTrace);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 text-silver-3 hover:text-silver-1 transition-colors"
      >
        {isWorking ? (
          <span className="w-[6px] h-[6px] rounded-full bg-mint animate-blink" />
        ) : (
          <Icon name="check" className="w-3 h-3 text-mint" />
        )}
        <span className="text-[12px] font-medium">{headerText}</span>
        <Icon
          name="chevron-down"
          className={clsx(
            "w-3 h-3 transition-transform duration-300",
            expanded ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      <div
        className={clsx(
          "grid transition-all duration-300 ease-out",
          expanded
            ? "grid-rows-[1fr] opacity-100 mt-1.5"
            : "grid-rows-[0fr] opacity-0 mt-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pl-4 border-l border-line-1 flex flex-wrap items-center gap-1.5">
            {displayTrace.map((t, i) => {
              const isWrite = WRITE_TOOLS.has(t.name);
              const isPending = t.output === "(pending…)";
              return (
                <span
                  key={i}
                  className={clsx(
                    "inline-flex items-center gap-1 px-2 py-[2px] rounded-pill border text-[11px]",
                    isPending
                      ? "border-line-2 text-silver-3"
                      : isWrite
                        ? "border-mint/[0.6] bg-mint/[0.22] text-mint"
                        : "border-mint/[0.35] bg-mint/[0.10] text-mint/90",
                  )}
                  title={t.name}
                >
                  {isPending ? (
                    <span className="w-[5px] h-[5px] rounded-full bg-current animate-blink" />
                  ) : (
                    <Icon name="check" className="w-[10px] h-[10px]" />
                  )}
                  {labelFor(t.name, isPending)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
