"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useCompassStore } from "@/store/compass";
import { STEP_SEQUENCE, type StepKey } from "@/lib/path";
import { StarMark } from "@/components/visuals/StarMark";

const STEP_FROM_PATH: Record<string, StepKey> = {
  "/create/strategy": "strategy",
  "/create/deposit": "deposit",
  "/create/markets": "markets",
  "/create/review": "review",
  "/create/launching": "launching",
};

const STRATEGY_LABEL: Record<string, string> = {
  conservative: "Conservative",
  balanced: "Balanced",
  growth: "Growth",
};

// Only the chains the engine actually routes between today. Stating
// "+6 chains" was demo-skin theatre — keep this in sync with backend
// ChainId enum.
const NETWORK_LABEL = "Arc + Arbitrum Sepolia";

export function ProgressCard() {
  const pathname = usePathname();
  const { path, strategy, amount, markets } = useCompassStore();

  const current = STEP_FROM_PATH[pathname];
  const seq = STEP_SEQUENCE[path];
  const currentIdx = current ? seq.indexOf(current) : 0;
  const total = seq.length;
  const isReady = current === "review" || current === "launching";

  const strategyVal = strategy ? STRATEGY_LABEL[strategy] : "—";
  const depositVal = amount > 0 ? `${amount.toFixed(2)} USDC` : "—";
  const marketsVal =
    path === "preset"
      ? "AI selected"
      : markets.length > 0
        ? `${markets.length} selected`
        : "—";

  return (
    <div
      className={clsx(
        "grid grid-cols-[auto_1fr_auto] gap-6 items-center px-[22px] py-4 mb-11 rounded-2xl",
        "border border-line-2 backdrop-blur-xl",
        "bg-gradient-to-b from-white/[0.04] to-white/[0.012]",
      )}
    >
      <div className="inline-flex items-center gap-[10px] pr-[22px] border-r border-line-2">
        <StarMark className="w-[22px] h-[22px]" />
        <div className="leading-tight">
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
            Compass
          </div>
          <div className="font-display text-[13px] font-medium tracking-[-0.01em] text-silver-1">
            Untitled
          </div>
        </div>
      </div>

      <div className="flex gap-7 flex-wrap">
        <Field label="Strategy" value={strategyVal} set={!!strategy} />
        <Field label="Deposit" value={depositVal} set={amount > 0} />
        <Field label="Markets" value={marketsVal} set={marketsVal !== "—"} />
        <Field label="Network" value={NETWORK_LABEL} set />
      </div>

      <div
        className={clsx(
          "inline-flex items-center gap-2 px-[11px] py-[5px] rounded-pill",
          "font-mono text-[10px] tracking-[0.1em] uppercase font-medium border",
          isReady
            ? "bg-mint/[0.08] border-mint/[0.25] text-mint"
            : "bg-amber/[0.08] border-amber/[0.25] text-amber",
        )}
      >
        <span
          className={clsx(
            "w-[5px] h-[5px] rounded-full",
            isReady ? "bg-mint" : "bg-amber",
          )}
        />
        {isReady
          ? `Ready · ${currentIdx + 1} of ${total}`
          : `${currentIdx + 1} of ${total}`}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4 mb-[3px]">
        {label}
      </div>
      <div
        className={clsx(
          "font-display text-[13px] font-medium tracking-[-0.01em]",
          set ? "text-silver-1" : "text-silver-5 italic",
        )}
      >
        {value}
      </div>
    </div>
  );
}
