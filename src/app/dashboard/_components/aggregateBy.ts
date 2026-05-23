import type { PositionHolding } from "@/lib/api";

export function aggregateBy<K extends string>(
  holdings: PositionHolding[],
  keyFn: (h: PositionHolding) => K,
): Record<K, bigint> {
  return holdings.reduce(
    (acc, h) => {
      const k = keyFn(h);
      acc[k] = (acc[k] ?? 0n) + BigInt(h.amount);
      return acc;
    },
    {} as Record<K, bigint>,
  );
}
