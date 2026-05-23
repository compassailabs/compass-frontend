import clsx from "clsx";

import { StarMark } from "@/components/visuals/StarMark";

import { Field } from "./atoms";
import { sectionBase, sectionNeutral } from "./styles";

/**
 * Top identity row — Compass + strategy name, smart account address,
 * connected EOA, network summary.
 */
export function IdentitySection({
  strategyLabel,
  smartAccount,
  address,
}: {
  strategyLabel: string;
  smartAccount: string | null;
  address: `0x${string}` | undefined;
}) {
  return (
    <section
      className={clsx(
        sectionBase,
        sectionNeutral,
        "[grid-area:identity] pl-[22px] pr-[22px] pt-4 pb-4",
      )}
    >
      <div
        className={clsx(
          "grid items-center gap-[22px] grid-cols-[auto_1fr_auto_auto]",
          "max-[880px]:grid-cols-[auto_1fr]",
        )}
      >
        <StarMark className="w-[38px] h-[38px] drop-shadow-[0_2px_8px_rgba(255,255,255,0.18)]" />
        <div className="min-w-0">
          <div className="font-display text-[17px] font-semibold leading-[1.2] tracking-[-0.018em] text-silver-1">
            Compass · {strategyLabel}
          </div>
          <div className="mt-[2px] font-mono text-[10.5px] tracking-[0.04em] text-silver-4 truncate">
            Smart account ·{" "}
            {smartAccount ? (
              <span className="text-silver-2">{smartAccount}</span>
            ) : (
              <span className="text-amber">deploys on sign</span>
            )}
          </div>
        </div>
        <Field
          k="Owner"
          v={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
        />
        <Field k="Network" v="Arc + Arbitrum" />
      </div>
    </section>
  );
}
