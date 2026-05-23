/**
 * Client for the compass-rs HTTP backend.
 *
 * Always same-origin `/api/*` — Next.js rewrites in `next.config.mjs`
 * proxy `/api/*` to `BACKEND_URL` server-side. The real backend host
 * never reaches the browser bundle, and we get zero-CORS, single-domain
 * deployment for free. Set `BACKEND_URL` (no `NEXT_PUBLIC_` prefix) in
 * `.env.local` or the host's environment.
 */
export const API_BASE = "/api";

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  text: string;
}

export interface ToolTrace {
  turn: number;
  name: string;
  input: unknown;
  output: string;
}

export interface ChatResult {
  model: string;
  turns: number;
  reply: string;
  trace: ToolTrace[];
}

// ── Streaming chat ────────────────────────────────────────────────

import { fetchEventSource } from "@microsoft/fetch-event-source";

export type StreamEventType =
  | "text_delta"
  | "thinking_delta"
  | "tool_call"
  | "tool_result"
  | "text_replace"
  | "message_stop"
  | "error";

export interface StreamEventBase {
  type: StreamEventType;
}

export interface TextDeltaEvent extends StreamEventBase {
  type: "text_delta";
  text: string;
}

export interface ThinkingDeltaEvent extends StreamEventBase {
  type: "thinking_delta";
  text: string;
}

export interface ToolCallEvent extends StreamEventBase {
  type: "tool_call";
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResultEvent extends StreamEventBase {
  type: "tool_result";
  id: string;
  name: string;
  output: string;
}

export interface TextReplaceEvent extends StreamEventBase {
  type: "text_replace";
  text: string;
}

export interface MessageStopEvent extends StreamEventBase {
  type: "message_stop";
  stop_reason: string;
}

export interface ErrorEvent extends StreamEventBase {
  type: "error";
  message: string;
}

export type StreamChatEvent =
  | TextDeltaEvent
  | ThinkingDeltaEvent
  | ToolCallEvent
  | ToolResultEvent
  | TextReplaceEvent
  | MessageStopEvent
  | ErrorEvent;

/**
 * Open a streaming chat. Backend SSE emits typed events; this helper
 * normalises them and pumps them into `onEvent`. Resolves when the
 * stream closes cleanly (after `message_stop`) and rejects on network
 * failure or non-OK status. Caller controls abort via `signal`.
 *
 * Server is the source of truth for chat history — clients only send
 * the new message; recent turns are pulled from DB inside the handler.
 */
export async function streamChat(
  user: string,
  message: string,
  onEvent: (event: StreamChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  await fetchEventSource(`${API_BASE}/chat/${user}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
    // fetch-event-source retries by default on disconnect — disable so
    // an explicit abort or server-side message_stop ends the stream.
    openWhenHidden: true,
    async onopen(resp) {
      if (resp.ok) return;
      const body = await resp.text().catch(() => "");
      throw new Error(`chat ${resp.status}: ${body || resp.statusText}`);
    },
    onmessage(ev) {
      if (!ev.data) return;
      let parsed: StreamChatEvent;
      try {
        parsed = JSON.parse(ev.data) as StreamChatEvent;
      } catch {
        return;
      }
      onEvent(parsed);
    },
    onerror(err) {
      // Throwing aborts the stream + bubbles to the caller.
      throw err;
    },
  });
}

export interface ChatTurnRow {
  id: number;
  ts: string;
  role: ChatRole;
  text: string;
  trace: ToolTrace[] | null;
}

export async function getChatHistory(
  user: string,
  signal?: AbortSignal,
  limit = 50,
): Promise<ChatTurnRow[]> {
  const resp = await fetch(
    `${API_BASE}/chat/${user}/history?limit=${limit}`,
    { signal },
  );
  if (!resp.ok) throw new Error(`getChatHistory ${resp.status}`);
  return resp.json();
}

/**
 * Wipes the user's chat history on the server. Powers the New chat
 * button — the page also resets local state so the UI updates instantly
 * without waiting for the next history fetch.
 */
export async function clearChatHistory(user: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/chat/${user}/history`, {
    method: "DELETE",
  });
  if (!resp.ok) {
    throw new Error(`clearChatHistory ${resp.status}`);
  }
}

// ── Policy types (mirror compass-rs src/automation/policy/schema.rs) ──

export type ChainId = "arc" | "arbitrum_sepolia";
export type ProtocolId = "idle" | "aave_v3";
export type RiskLabel = "conservative" | "balanced" | "growth";
export type PolicyStatus = "active" | "paused";

export interface VenueRef {
  chain: ChainId;
  protocol: ProtocolId;
}

export interface Policy {
  version: number;
  user: string;
  risk_label: RiskLabel;
  created_at: string;
  compiled_from?: string | null;
  status?: PolicyStatus;
  protocols: {
    whitelist: VenueRef[];
    per_protocol_cap_pct: number;
  };
  chains: { whitelist: ChainId[] };
  triggers: {
    apr_delta_bps: number;
    apr_lookback_minutes: number;
    min_idle_minutes: number;
  };
  caps: {
    max_move_pct_per_action: number;
    max_actions_per_day: number;
    min_net_profit_usd: number;
  };
  gas: {
    estimated_hold_days: number;
    max_gas_usd_per_action: number;
  };
  circuit_breakers: {
    usdc_peg_min: number;
    utilization_max: number;
    tvl_drop_pct_1h: number;
    protocol_blacklist_on_event: boolean;
  };
  notifications?: null;
}

/**
 * Per-risk-profile defaults — keep in sync with chat_agent.rs system
 * prompt so the wizard path and the chat path produce structurally
 * comparable Policies.
 */
const PROFILE_DEFAULTS: Record<
  RiskLabel,
  {
    per_protocol_cap_pct: number;
    apr_delta_bps: number;
    max_actions_per_day: number;
    min_net_profit_usd: number;
    max_gas_usd_per_action: number;
  }
> = {
  // Demo / testnet defaults: BOTH `min_net_profit_usd` and `apr_delta_bps`
  // are dialled way down from production values (150/100/50 bps + $2/$1/$0
  // min profit) so the engine actually fires on testnet AAVE's ~29 bps
  // APR. Without this, every preset would Noop with
  // `apr_delta_below_threshold` and nothing would ever execute.
  conservative: {
    per_protocol_cap_pct: 50,
    apr_delta_bps: 20,
    max_actions_per_day: 3,
    min_net_profit_usd: 0,
    max_gas_usd_per_action: 3,
  },
  balanced: {
    per_protocol_cap_pct: 70,
    apr_delta_bps: 10,
    max_actions_per_day: 6,
    min_net_profit_usd: 0,
    max_gas_usd_per_action: 5,
  },
  growth: {
    per_protocol_cap_pct: 100,
    apr_delta_bps: 5,
    max_actions_per_day: 12,
    min_net_profit_usd: 0,
    max_gas_usd_per_action: 10,
  },
};

/**
 * Build a backend-compatible Policy from the wizard's risk selection.
 * Whitelist is fixed to the three backend-supported venues for now
 * (Idle on both chains + AAVE on Arbitrum Sepolia). When more protocol
 * adapters land in compass-rs, extend this to honor the wizard's
 * per-market selection.
 */
export function compilePolicyFromWizard(opts: {
  user: string;
  strategy: RiskLabel;
  intentText?: string;
}): Policy {
  const d = PROFILE_DEFAULTS[opts.strategy];
  return {
    version: 0,
    user: opts.user,
    risk_label: opts.strategy,
    created_at: new Date().toISOString(),
    compiled_from:
      opts.intentText ?? `Compass wizard · ${opts.strategy} preset`,
    status: "active",
    protocols: {
      whitelist: [
        { chain: "arc", protocol: "idle" },
        { chain: "arbitrum_sepolia", protocol: "idle" },
        { chain: "arbitrum_sepolia", protocol: "aave_v3" },
      ],
      per_protocol_cap_pct: d.per_protocol_cap_pct,
    },
    chains: { whitelist: ["arc", "arbitrum_sepolia"] },
    triggers: {
      apr_delta_bps: d.apr_delta_bps,
      apr_lookback_minutes: 60,
      min_idle_minutes: 30,
    },
    caps: {
      max_move_pct_per_action: 100,
      max_actions_per_day: d.max_actions_per_day,
      min_net_profit_usd: d.min_net_profit_usd,
    },
    gas: {
      estimated_hold_days: 7,
      max_gas_usd_per_action: d.max_gas_usd_per_action,
    },
    circuit_breakers: {
      usdc_peg_min: 0.98,
      utilization_max: 0.95,
      tvl_drop_pct_1h: 30.0,
      protocol_blacklist_on_event: true,
    },
    notifications: null,
  };
}

export async function putPolicy(
  user: string,
  policy: Policy,
): Promise<{ version: number }> {
  const resp = await fetch(`${API_BASE}/policy/${user}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(policy),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(
      `putPolicy ${resp.status}: ${body || resp.statusText}`,
    );
  }
  return resp.json();
}

export async function getPolicy(
  user: string,
  signal?: AbortSignal,
): Promise<Policy | null> {
  const resp = await fetch(`${API_BASE}/policy/${user}`, { signal });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`getPolicy ${resp.status}`);
  return resp.json();
}

export async function pausePolicy(
  user: string,
): Promise<{ status: PolicyStatus }> {
  const resp = await fetch(`${API_BASE}/policy/${user}/pause`, {
    method: "POST",
  });
  if (!resp.ok) throw new Error(`pausePolicy ${resp.status}`);
  return resp.json();
}

export async function resumePolicy(
  user: string,
): Promise<{ status: PolicyStatus }> {
  const resp = await fetch(`${API_BASE}/policy/${user}/resume`, {
    method: "POST",
  });
  if (!resp.ok) throw new Error(`resumePolicy ${resp.status}`);
  return resp.json();
}

// ── Audit + Position read shapes (mirror compass-rs) ──

export interface AuditEvent {
  id: number;
  ts: string;
  user: string;
  event_type:
    | "trigger_fired"
    | "evaluator_thought"
    | "evaluator_decision"
    | "risk_gate_decision"
    | "llm_escalate_in"
    | "llm_escalate_out"
    | "executor_action_start"
    | "executor_substep"
    | "executor_action_done"
    | "circuit_break"
    | "policy_change"
    | "session_revoke";
  policy_version: number | null;
  payload: unknown;
  tx_hash: string | null;
  chain: ChainId | null;
  cost_usd: number | null;
}

export interface PositionHolding {
  venue: VenueRef;
  amount: string; // U256 raw 6-decimal USDC (decimal string)
}

export interface PositionLastAction {
  venue: VenueRef;
  at: string;
}

export interface Position {
  holdings: PositionHolding[];
  last_action_at: PositionLastAction[];
  actions_today: number;
}

export async function getAudit(
  user: string,
  opts: { since?: number; limit?: number } = {},
  signal?: AbortSignal,
): Promise<AuditEvent[]> {
  const qs = new URLSearchParams();
  if (opts.since !== undefined) qs.set("since", String(opts.since));
  if (opts.limit !== undefined) qs.set("limit", String(opts.limit));
  const url = `${API_BASE}/policy/${user}/audit${qs.toString() ? `?${qs}` : ""}`;
  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`getAudit ${resp.status}`);
  return resp.json();
}

export async function getPosition(
  user: string,
  signal?: AbortSignal,
): Promise<Position | null> {
  const resp = await fetch(`${API_BASE}/position/${user}`, { signal });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`getPosition ${resp.status}`);
  return resp.json();
}

// ── Balance (smart-account USDC on both chains) ──

export interface BalanceResponse {
  user: string;
  /// Same address on both chains (CREATE2).
  smart_account: string;
  arc_usdc_6dec: string;
  arbitrum_sepolia_usdc_6dec: string;
  arc_usdc: string; // "1.000000"
  arbitrum_sepolia_usdc: string;
  has_funds: boolean;
}

export async function getBalance(
  user: string,
  signal?: AbortSignal,
): Promise<BalanceResponse> {
  const resp = await fetch(`${API_BASE}/balance/${user}`, { signal });
  if (!resp.ok) throw new Error(`getBalance ${resp.status}`);
  return resp.json();
}

// ── Funded (record user-initiated USDC custody events) ──

export type FundingKind = "deposit" | "withdraw_to_eoa";

export interface FundedRequest {
  chain: ChainId;
  kind: FundingKind;
  amount_6dec: string;
  tx_hash: string;
}

/**
 * Tell the backend a Fund / Deposit transfer landed on-chain. Idempotent
 * on (user, chain, kind, tx_hash) — re-posting the same tx is safe and
 * the second call returns the original id without duplicating the row.
 * Powers `/earnings` net-deposited without log-scanning.
 */
export async function recordFunded(
  user: string,
  body: FundedRequest,
  signal?: AbortSignal,
): Promise<{ id: number }> {
  const resp = await fetch(`${API_BASE}/funded/${user}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!resp.ok) throw new Error(`recordFunded ${resp.status}`);
  return resp.json();
}

// ── Earnings ──

export interface EarningsResponse {
  user: string;
  smart_account: string;
  /// Raw 6-decimal USDC the user has funded into Compass (cumulative
  /// from the funding_event table; survives restart on Postgres).
  net_deposited_6dec: string;
  /// Current total Compass-held value (idle USDC + AAVE position).
  current_value_6dec: string;
  /// Signed string. Positive means yield; "-" prefix means a loss
  /// (bridge / gas exceeded yield — show it honestly).
  gross_earned_6dec: string;
  performance_fee_pct: number;
  fee_6dec: string;
  net_earned_6dec: string;
}

export async function getEarnings(
  user: string,
  signal?: AbortSignal,
): Promise<EarningsResponse> {
  const resp = await fetch(`${API_BASE}/earnings/${user}`, { signal });
  if (!resp.ok) throw new Error(`getEarnings ${resp.status}`);
  return resp.json();
}

// ── Withdraw ──

export interface WithdrawStep {
  label: string;
  chain: "arc" | "arbitrum_sepolia";
  tx_hash: string;
}

export interface WithdrawResponse {
  user: string;
  arc_smart_account: string;
  arbitrum_smart_account: string;
  /// aToken balance held by the Arbitrum Diamond before the withdraw,
  /// raw 6-decimal USDC.
  aave_balance_6dec: string;
  /// Amount that crossed the bridge to Arc, raw 6-decimal USDC.
  /// Equals the Arbitrum Diamond's USDC balance right after the AAVE
  /// withdraw (so it picks up any pre-existing idle balance too).
  bridged_6dec: string;
  steps: WithdrawStep[];
}

/**
 * Full reverse unwind: AAVE on Arbitrum → Gateway bridge → Compass
 * smart account on Arc. Funds never leave the user's smart-account
 * envelope; they just end up on the chain where the deposit
 * originally landed. The owner key on the server signs all txs so the
 * user only clicks once.
 */
export async function withdrawAll(
  user: string,
  signal?: AbortSignal,
): Promise<WithdrawResponse> {
  const resp = await fetch(`${API_BASE}/withdraw/${user}`, {
    method: "POST",
    signal,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`withdrawAll ${resp.status}${text ? `: ${text}` : ""}`);
  }
  return resp.json();
}

// ── Send to wallet (final custody exit) ──

export interface SendToWalletResponse {
  user: string;
  smart_account: string;
  /// Arc Diamond USDC balance before the transfer (raw 6-dec).
  balance_before_6dec: string;
  /// Amount that actually moved to the EOA (raw 6-dec).
  sent_6dec: string;
  /// `null` when there was nothing to send.
  tx_hash: string | null;
}

/**
 * Pulls every spare USDC out of the Compass smart account on Arc and
 * sends it to the user's EOA. The actual custody exit (after this the
 * money is in the user's wallet, outside Compass).
 *
 * Pairs with `withdrawAll`:
 *   - `withdrawAll`: AAVE on Arbitrum → smart account on Arc
 *   - `sendToWallet`: smart account on Arc → user EOA
 * Run both in sequence for a full exit; either independently for
 * partial actions.
 */
export async function sendToWallet(
  user: string,
  signal?: AbortSignal,
): Promise<SendToWalletResponse> {
  const resp = await fetch(`${API_BASE}/send-to-wallet/${user}`, {
    method: "POST",
    signal,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`sendToWallet ${resp.status}${text ? `: ${text}` : ""}`);
  }
  return resp.json();
}

// ── Markets ──

export interface MarketEntry {
  chain: ChainId;
  protocol: ProtocolId;
  /// Pre-composed display name from the backend ("AAVE v3 on Arbitrum
  /// Sepolia"). Render verbatim so wizard pages don't redo the mapping.
  label: string;
  /// Decimal APR, e.g. 0.0421 for 4.21%. 0 for non-yield venues.
  apr: number;
  is_yield_venue: boolean;
  /// "live" — engine actually routes here; "soon" — listed for UI only.
  status: "live" | "soon";
}

export interface MarketsResponse {
  markets: MarketEntry[];
}

export async function getMarkets(
  signal?: AbortSignal,
): Promise<MarketsResponse> {
  const resp = await fetch(`${API_BASE}/markets`, { signal });
  if (!resp.ok) throw new Error(`getMarkets ${resp.status}`);
  return resp.json();
}

/** Stable string id for a venue: `chain:protocol`. Used in wizard state. */
export function venueKey(m: { chain: ChainId; protocol: ProtocolId }): string {
  return `${m.chain}:${m.protocol}`;
}

// ── Session (smart-account + session-key) ──

export interface DiamondStatus {
  chain: "arc" | "arbitrum_sepolia";
  address: string;
  deployed: boolean;
  session_valid: boolean;
  session_expires_at: number;
}

export interface SessionStatus {
  user: string;
  agent: string;
  salt: number;
  arc: DiamondStatus;
  arbitrum_sepolia: DiamondStatus;
  addresses_match: boolean;
  ready: boolean;
}

export interface SessionSetupResult {
  status: SessionStatus;
  deploy: { arc_tx: string | null; arb_tx: string | null };
  session: { arc_tx: string | null; arb_tx: string | null };
}

export async function getSession(
  user: string,
  signal?: AbortSignal,
): Promise<SessionStatus> {
  const resp = await fetch(`${API_BASE}/session/${user}`, { signal });
  if (!resp.ok) throw new Error(`getSession ${resp.status}`);
  return resp.json();
}

export async function setupSession(
  user: string,
): Promise<SessionSetupResult> {
  const resp = await fetch(`${API_BASE}/session/${user}/setup`, {
    method: "POST",
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(
      `setupSession ${resp.status}: ${body || resp.statusText}`,
    );
  }
  return resp.json();
}
