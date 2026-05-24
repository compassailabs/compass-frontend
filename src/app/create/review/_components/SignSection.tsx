import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import { SectionHead } from "./atoms";
import { sectionBase, sectionMint } from "./styles";

export function SignSection({
  address,
}: {
  address: `0x${string}` | undefined;
}) {
  return (
    <section className={clsx(sectionBase, sectionMint, "[grid-area:sign]")}>
      <SectionHead n="05" label="Signature" mint />
      <div className="flex flex-col gap-[14px]">
        {[
          <>
            <b>Single signature.</b> Commits the policy; engine starts ticking
            next cycle.
          </>,
          <>
            After this, Compass <b>moves your USDC for you</b>.
          </>,
          <>
            You stay in control: <b>pause or withdraw anytime</b>.
          </>,
        ].map((line, i) => (
          <div
            key={i}
            className="flex items-start gap-[10px] text-[13px] text-silver-2 leading-[1.45] [&_b]:text-silver-1 [&_b]:font-medium"
          >
            <Icon name="check" className="w-[14px] h-[14px] mt-[2px] text-mint" />
            <span>{line}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-[10px] mt-1 pt-3 border-t border-dashed border-mint/[0.18] font-mono text-[10px] tracking-[0.08em] uppercase text-silver-4">
        <span className="w-[6px] h-[6px] rounded-full bg-mint animate-mint-pulse" />
        {address ? "Wallet ready · network Arc" : "Connect a wallet first"}
      </div>
    </section>
  );
}
