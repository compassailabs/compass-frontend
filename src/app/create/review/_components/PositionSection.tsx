import clsx from "clsx";

import { Line, SectionHead } from "./atoms";
import { sectionBase, sectionNeutral } from "./styles";

export function PositionSection({
  amount,
  address,
}: {
  amount: number;
  address: `0x${string}` | undefined;
}) {
  return (
    <section
      className={clsx(sectionBase, sectionNeutral, "[grid-area:position]")}
    >
      <SectionHead n="02" label="Position" />
      <div className="flex items-baseline gap-3">
        <span className="font-mono [font-feature-settings:'tnum'] text-[42px] font-medium leading-none tracking-[-0.035em] text-silver-1">
          {amount > 0
            ? amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "—"}
        </span>
        <span className="font-display text-[17px] font-normal tracking-[-0.018em] text-silver-4">
          USDC
        </span>
      </div>
      <div className="flex flex-col gap-[7px]">
        <Line
          k="Source"
          v={`Arc · ${address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "wallet"}`}
        />
        <Line k="Settles to" v="Compass smart account" />
        <Line k="Custody" v="Non-custodial" mint />
        <Line k="Withdraw" v="Anytime · 1 signature" />
      </div>
    </section>
  );
}
