export const PRESETS = [
  { label: "25%", pct: 25 },
  { label: "50%", pct: 50 },
  { label: "MAX", pct: 100 },
] as const;

export const MIN_DEPOSIT = 0;

export const VENUE_DOT_BY_KEY: Record<string, string> = {
  "arc:idle": "bg-silver-1",
  "arbitrum_sepolia:idle": "bg-silver-2",
  "arbitrum_sepolia:aave_v3": "bg-mint",
};

export const VENUE_GRAD_BY_KEY: Record<string, string> = {
  "arc:idle": "from-silver-1 to-silver-2",
  "arbitrum_sepolia:idle": "from-silver-2 to-silver-3",
  "arbitrum_sepolia:aave_v3": "from-mint to-[#5EBA94]",
};

export function presetFor(amount: number, maxBal: number): number | null {
  if (maxBal <= 0) return null;
  if (amount === maxBal) return 100;
  const pct = Math.round((amount / maxBal) * 100);
  return PRESETS.find((p) => p.pct === pct)?.pct ?? null;
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
