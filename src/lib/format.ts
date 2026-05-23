import type { ChainId, ProtocolId } from "@/lib/api";

/**
 * Cross-page formatting helpers. Kept tiny and pure so the same string a
 * user sees in Holdings, Audit feed, Dashboard tiles, etc. is always
 * produced by the same function — no per-page label drift.
 */

/** raw 6-decimal USDC bigint → "1,234.56" (rounded to 2 decimals). */
export function formatUsdc(raw: bigint): string {
  const whole = raw / 1_000_000n;
  const frac = raw % 1_000_000n;
  const fracStr = String(frac).padStart(6, "0").slice(0, 2);
  return `${whole.toLocaleString()}.${fracStr}`;
}

export function chainLabel(c: ChainId): string {
  return c === "arc" ? "Arc" : "Arbitrum Sepolia";
}

// "Available" instead of "Wallet" — we now use "Wallet" elsewhere to
// mean the user's EOA (Withdraw target), so overloading the same word
// for the Compass-side idle balance creates ambiguity. "Available"
// reads as "ready to deploy or pull out", which is exactly what idle
// USDC inside the smart account is.
export function protocolLabel(p: ProtocolId): string {
  return p === "aave_v3" ? "AAVE v3" : "Available";
}

export function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function humanize(snake: string): string {
  return snake.replace(/_/g, " ");
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
