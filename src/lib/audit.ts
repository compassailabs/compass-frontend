import type { AuditEvent, ChainId, ProtocolId } from "@/lib/api";
import {
  capitalize,
  chainLabel,
  formatUsdc,
  humanize,
  protocolLabel,
} from "@/lib/format";

/**
 * Audit-feed summarization shared across the dashboard "recent activity"
 * preview and the dedicated `/activity` page. Two responsibilities:
 *   1. classify each backend `event_type` as Thought vs Move (the
 *      user-facing chip),
 *   2. project the raw payload into a one-sentence narrative the user
 *      can read at a glance ("Plan: move 5 USDC from … to … (est. net
 *      profit $0.12)." instead of "evaluator_decision act").
 *
 * Lives in lib (not a page) so two routes can render the same feed
 * without copy-paste drift on labels.
 */

/** One row in the rendered feed; wraps an event plus its collapse count. */
export type FeedRow = {
  event: AuditEvent;
  count: number;
  oldestTs: string;
};

// Move = anything that touches chain (executor_*). Everything else =
// Thought. The chip is intentionally low-information; the sentence next
// to it carries the actual data (amounts, venue, reason).
export const MOVE_EVENT_TYPES = new Set<string>([
  "executor_action_start",
  "executor_substep",
  "executor_action_done",
]);

export function eventTypeLabel(type: string): string {
  return MOVE_EVENT_TYPES.has(type) ? "Move" : "Thought";
}

export function isMoveEvent(type: string): boolean {
  return MOVE_EVENT_TYPES.has(type);
}

/** Thoughts exclude the engine heartbeat (trigger_fired) which we hide. */
export function isThoughtEvent(type: string): boolean {
  return !MOVE_EVENT_TYPES.has(type) && type !== "trigger_fired";
}

// Trigger kinds (`cron`, `policy_committed`, `manual`, …) come from the
// scheduler. Translate to a phrase that fits in a sentence.
const TRIGGER_KIND_LABEL: Record<string, string> = {
  cron: "Scheduled check",
  interval: "Scheduled check",
  policy_committed: "Strategy-update check",
  manual: "Manual run",
  startup: "Engine startup check",
};

// NoopReason / BreakReason enums on the backend serialize as snake_case
// strings (e.g. `best_venue_at_cap`). The audit feed is user-facing, so
// translate each known variant to a short phrase; unknown variants fall
// back to a humanized version of the raw key so a newly-added reason
// doesn't render as a debug token.
const NOOP_REASON_LABEL: Record<string, string> = {
  no_capital: "no capital to deploy",
  already_at_best_venue: "already at best venue",
  apr_delta_below_threshold: "APR gap below threshold",
  destination_in_cooldown: "destination cooling down",
  best_venue_at_cap: "best venue at allocation cap",
  gas_exceeds_cap: "gas cost above policy cap",
  ev_below_threshold: "expected profit below threshold",
  daily_quota_reached: "daily action quota reached",
  gateway_down: "Circle Gateway unavailable",
};

const BREAK_REASON_LABEL: Record<string, string> = {
  snapshot_stale: "market snapshot stale",
  usdc_depeg: "USDC depeg detected",
  venue_unhealthy: "venue health check failed",
};

type VenueLike = { chain: ChainId; protocol: ProtocolId };
type ActionLike = { from: VenueLike; to: VenueLike; amount: string };

function venueLabel(v: VenueLike): string {
  return `${protocolLabel(v.protocol)} on ${chainLabel(v.chain)}`;
}

function formatAmountRaw(rawUsdc: string | undefined): string {
  if (!rawUsdc) return "?";
  try {
    return formatUsdc(BigInt(rawUsdc));
  } catch {
    return rawUsdc;
  }
}

/**
 * Engine emits a `trigger_fired` heartbeat every tick (~minute), then a
 * sequence of `evaluator_thought` lines, then one `evaluator_decision`.
 * A user-facing feed should show state *changes*, not the same loop on
 * repeat — so we:
 *   1. drop `trigger_fired` entirely (the thoughts already narrate
 *      "I'm checking"),
 *   2. coalesce consecutive identical thought *labels* into one row with
 *      a `× N` badge,
 *   3. coalesce consecutive identical noop decisions the same way.
 * Anything else (act / policy_change / executor_* / risk_gate /
 * circuit_break) passes through as an individual row so the timeline
 * preserves every interesting moment.
 */
export function collapseFeed(events: AuditEvent[]): FeedRow[] {
  const out: FeedRow[] = [];
  for (const e of events) {
    if (e.event_type === "trigger_fired") continue;
    const last = out[out.length - 1];
    if (last && isCollapsible(last.event, e)) {
      last.count += 1;
      last.oldestTs = e.ts; // events are newest-first → older sits later
      continue;
    }
    out.push({ event: e, count: 1, oldestTs: e.ts });
  }
  return out;
}

function isCollapsible(a: AuditEvent, b: AuditEvent): boolean {
  if (a.event_type !== b.event_type) return false;
  if (a.event_type === "evaluator_decision") {
    const ap = a.payload as { kind?: string; reason?: string } | null;
    const bp = b.payload as { kind?: string; reason?: string } | null;
    return (
      ap?.kind === "noop" && bp?.kind === "noop" && ap.reason === bp.reason
    );
  }
  if (a.event_type === "evaluator_thought") {
    const ap = a.payload as { label?: string } | null;
    const bp = b.payload as { label?: string } | null;
    return !!ap?.label && ap.label === bp?.label;
  }
  return false;
}

export function summarizeAudit(e: AuditEvent): {
  label: string;
  accent: string;
} {
  switch (e.event_type) {
    case "trigger_fired": {
      const p = e.payload as { trigger_kind?: string } | null;
      const raw = p?.trigger_kind;
      const phrase = raw
        ? (TRIGGER_KIND_LABEL[raw] ?? capitalize(humanize(raw)))
        : "Scheduled check";
      return {
        label: `${phrase} started — engine waking up to evaluate positions.`,
        accent: "text-silver-4",
      };
    }
    case "evaluator_thought": {
      // Backend hand-crafts the sentence; we render it verbatim so the
      // narration stays consistent with what evaluator/mod.rs writes.
      const p = e.payload as { label?: string } | null;
      return {
        label: p?.label ?? "Thinking…",
        accent: "text-silver-2",
      };
    }
    case "evaluator_decision": {
      const p = e.payload as
        | {
            kind?: string;
            reason?: { kind?: string } | string;
            plan?: {
              actions?: ActionLike[];
              expected_profit_usd?: number;
              estimated_cost_usd?: number;
            };
          }
        | null;
      const kind = p?.kind;
      if (kind === "act") {
        const a = p?.plan?.actions?.[0];
        const profit = p?.plan?.expected_profit_usd;
        if (a) {
          const amt = formatAmountRaw(a.amount);
          const profitStr =
            typeof profit === "number"
              ? ` (est. net profit $${profit.toFixed(2)})`
              : "";
          return {
            label: `Plan: move ${amt} USDC from ${venueLabel(a.from)} to ${venueLabel(a.to)}${profitStr}.`,
            accent: "text-mint",
          };
        }
        return { label: "Rebalance proposed.", accent: "text-mint" };
      }
      if (kind === "noop") {
        const raw = typeof p?.reason === "string" ? p.reason : null;
        const reason = raw
          ? (NOOP_REASON_LABEL[raw] ?? humanize(raw))
          : "no change required";
        return {
          label: `Portfolio is optimized — ${reason}. No actions taken.`,
          accent: "text-silver-4",
        };
      }
      if (kind === "circuit_break") {
        const inner =
          typeof p?.reason === "object" ? p?.reason?.kind : undefined;
        const detail = inner
          ? (BREAK_REASON_LABEL[inner] ?? humanize(inner))
          : "a safety condition";
        return {
          label: `Circuit break engaged: ${detail}. Engine pausing for review.`,
          accent: "text-amber",
        };
      }
      if (kind === "escalate") {
        return {
          label: "Escalating to LLM — situation needs human-level reasoning.",
          accent: "text-steel",
        };
      }
      return {
        label: capitalize(humanize(kind ?? "decision")),
        accent: "text-silver-3",
      };
    }
    case "policy_change": {
      return {
        label: `Strategy committed — engine now running policy v${e.policy_version ?? "?"}.`,
        accent: "text-silver-2",
      };
    }
    case "executor_action_start": {
      const a = e.payload as ActionLike | null;
      if (a?.from && a?.to && a?.amount) {
        return {
          label: `Starting move: ${formatAmountRaw(a.amount)} USDC from ${venueLabel(a.from)} → ${venueLabel(a.to)}.`,
          accent: "text-steel",
        };
      }
      return { label: "Execution started.", accent: "text-steel" };
    }
    case "executor_substep": {
      const p = e.payload as { label?: string } | null;
      const label = p?.label ?? "step";
      return { label: `${capitalize(label)}.`, accent: "text-steel" };
    }
    case "executor_action_done": {
      const p = e.payload as { action?: ActionLike; error?: string } | null;
      if (p?.error) {
        const trimmed =
          p.error.length > 100 ? `${p.error.slice(0, 100)}…` : p.error;
        return { label: `Move failed: ${trimmed}`, accent: "text-amber" };
      }
      const a = p?.action;
      if (a?.to && a?.amount) {
        return {
          label: `Move complete — ${formatAmountRaw(a.amount)} USDC now in ${venueLabel(a.to)}.`,
          accent: "text-mint",
        };
      }
      return {
        label: "Execution verified. Position settled.",
        accent: "text-mint",
      };
    }
    case "risk_gate_decision": {
      const p = e.payload as { decision?: string; reason?: string } | null;
      if (p?.decision === "reject") {
        return {
          label: `Safety check rejected — ${p?.reason ?? "policy violation"}.`,
          accent: "text-amber",
        };
      }
      return {
        label: "Safety check passed — plan cleared for execution.",
        accent: "text-silver-3",
      };
    }
  }
  return { label: "—", accent: "text-silver-4" };
}
