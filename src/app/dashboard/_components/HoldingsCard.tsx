import { AssetIcon } from "@/components/visuals/AssetIcon";
import type { PositionHolding } from "@/lib/api";
import { chainLabel, formatUsdc, protocolLabel } from "@/lib/format";

/**
 * Holdings table — one row per active venue with non-dust balance.
 * Shows token icon (USDC + chain badge), venue name, chain + share,
 * and USDC + USD equivalents.
 */
export function HoldingsCard({
  holdings,
  total,
}: {
  holdings: PositionHolding[];
  total: bigint;
}) {
  return (
    <section className="rounded-[18px] border border-line-2 bg-white/[0.03] backdrop-blur-xl">
      <header className="px-5 py-4 border-b border-line-1 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          Holdings
        </span>
        <span className="font-mono text-[10px] text-silver-4">
          {holdings.length} venue{holdings.length === 1 ? "" : "s"}
        </span>
      </header>
      <ul className="divide-y divide-line-1">
        {holdings.map((h, i) => (
          <HoldingRow key={i} holding={h} total={total} />
        ))}
      </ul>
    </section>
  );
}

function HoldingRow({
  holding,
  total,
}: {
  holding: PositionHolding;
  total: bigint;
}) {
  const amount = BigInt(holding.amount);
  const pct = total > 0n ? Number((amount * 10000n) / total) / 100 : 0;
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">
      <AssetIcon chain={holding.venue.chain} size="md" />
      <div className="min-w-0">
        <div className="font-display text-[15px] font-medium tracking-[-0.012em] text-silver-1 truncate">
          {protocolLabel(holding.venue.protocol)}
        </div>
        <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-silver-4">
          USDC on {chainLabel(holding.venue.chain)} · {pct.toFixed(1)}%
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono [font-feature-settings:'tnum'] text-[15px] font-medium text-silver-1">
          {formatUsdc(amount)}
        </div>
        <div className="font-mono text-[11px] text-silver-4">
          ≈ ${formatUsdc(amount)}
        </div>
      </div>
    </li>
  );
}
