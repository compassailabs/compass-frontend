"use client";

import { useState } from "react";
import clsx from "clsx";

import type { ToolTrace } from "@/lib/api";

/**
 * Always-visible row of skill chips so the user can verify what the
 * agent actually invoked. Defeats fabricated confirmations: if there's
 * no `commit_policy` chip, no commit happened. Collapses past 3 chips
 * with a `+N more` toggle to keep the bubble header tidy on long runs.
 *
 * Chip states:
 *   * **pending** — pulsing dot, dim outline (no fill yet)
 *   * **done (read tool)** — soft silver fill + check mark
 *   * **done (write tool)** — mint fill + check mark, more saturated
 *     so writes pop visually next to reads
 */
export function ToolChips({ trace }: { trace: ToolTrace[] }) {
  const WRITE = new Set(["commit_policy", "pause_policy", "resume_policy"]);
  const COLLAPSED_LIMIT = 3;
  const [expanded, setExpanded] = useState(false);

  const overflow = trace.length - COLLAPSED_LIMIT;
  const visible =
    expanded || overflow <= 0 ? trace : trace.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="mb-1 flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
        Skills
      </span>
      {visible.map((t, i) => {
        const isWrite = WRITE.has(t.name);
        const pending = t.output === "(pending…)";
        return (
          <span
            key={i}
            className={clsx(
              "inline-flex items-center gap-1 px-2 py-[2px] rounded-pill border font-mono text-[10.5px]",
              pending
                ? "border-line-2 text-silver-4"
                : isWrite
                  ? "border-mint/[0.5] bg-mint/[0.22] text-mint"
                  : "border-line-3 bg-silver-2/[0.18] text-silver-1",
            )}
            title={pending ? `${t.name} (running…)` : `${t.name} — done`}
          >
            {pending ? (
              <span className="w-[5px] h-[5px] rounded-full bg-current animate-blink" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-[10px] h-[10px] fill-none stroke-current stroke-[3.2] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.name}
          </span>
        );
      })}
      {overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-mono text-[10px] text-silver-4 hover:text-silver-2 transition-colors"
        >
          {expanded ? "− show less" : `+${overflow} more`}
        </button>
      )}
    </div>
  );
}
