import clsx from "clsx";

import type { ChainId, ProtocolId } from "@/lib/api";
import { chainLabel, protocolLabel } from "@/lib/format";

export function DistributionCard({
  label,
  parts,
  total,
  kind,
}: {
  label: string;
  parts: Record<string, bigint>;
  total: bigint;
  kind: "chain" | "protocol";
}) {
  const entries = Object.entries(parts).sort(([, a], [, b]) => Number(b - a));
  return (
    <section className="rounded-[18px] border border-line-2 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col gap-3">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
        {label}
      </span>
      <div className="flex h-2 rounded-pill overflow-hidden bg-white/[0.04]">
        {entries.map(([k, v]) => {
          const pct = total > 0n ? Number((v * 10000n) / total) / 100 : 0;
          return (
            <span
              key={k}
              className={clsx("h-full", colorForBar(k, kind))}
              style={{ width: `${pct}%` }}
              title={`${displayLabel(k, kind)} — ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <ul className="flex flex-col gap-1.5">
        {entries.map(([k, v]) => {
          const pct = total > 0n ? Number((v * 10000n) / total) / 100 : 0;
          return (
            <li
              key={k}
              className="grid grid-cols-[10px_1fr_auto] gap-2 items-center text-[12px]"
            >
              <span
                className={clsx(
                  "w-2 h-2 rounded-full",
                  colorForDot(k, kind),
                )}
              />
              <span className="text-silver-3">{displayLabel(k, kind)}</span>
              <span className="font-mono [font-feature-settings:'tnum'] text-silver-1">
                {pct.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function displayLabel(k: string, kind: "chain" | "protocol"): string {
  if (kind === "chain") return chainLabel(k as ChainId);
  return protocolLabel(k as ProtocolId);
}

function colorForBar(k: string, kind: "chain" | "protocol"): string {
  if (kind === "chain") {
    return k === "arc"
      ? "bg-gradient-to-r from-silver-1 to-silver-3"
      : "bg-[#0052FF]";
  }
  return k === "aave_v3"
    ? "bg-gradient-to-r from-mint to-[#5EBA94]"
    : "bg-gradient-to-r from-silver-3 to-silver-4";
}

function colorForDot(k: string, kind: "chain" | "protocol"): string {
  if (kind === "chain") {
    return k === "arc" ? "bg-silver-1" : "bg-[#0052FF]";
  }
  return k === "aave_v3" ? "bg-mint" : "bg-silver-3";
}
