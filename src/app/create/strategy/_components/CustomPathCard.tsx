import Link from "next/link";

export function CustomPathCard({ liveVenueCount }: { liveVenueCount: number }) {
  return (
    <Link
      href="/create/markets?path=custom"
      className="group mt-[14px] grid grid-cols-[52px_1fr_auto_auto] gap-[22px] items-center px-[26px] py-[22px] rounded-[18px] no-underline text-inherit border border-dashed border-line-3 backdrop-blur-xl transition-all duration-[220ms] bg-gradient-to-b from-white/[0.025] to-white/[0.008] relative overflow-hidden hover:border-solid hover:border-silver-3 hover:bg-gradient-to-b hover:from-white/[0.045] hover:to-white/[0.012] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] max-[880px]:grid-cols-[44px_1fr] max-[880px]:gap-[14px] max-[880px]:px-5 max-[880px]:py-[18px]"
    >
      <div className="w-[52px] h-[52px] rounded-[14px] grid place-items-center border border-line-2 bg-white/[0.035] text-silver-2 [&_svg]:w-[22px] [&_svg]:h-[22px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.6] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
        <svg viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 font-medium">
          Power user · alt path
        </div>
        <h3 className="m-0 font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.022em] text-silver-1 inline-flex items-center gap-[10px]">
          Custom
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase font-medium px-2 py-[3px] rounded-pill border border-line-2 text-silver-3">
            DIY
          </span>
        </h3>
        <p className="m-0 max-w-[60ch] text-[13px] text-silver-3 leading-[1.45] [&_b]:text-silver-1 [&_b]:font-medium">
          Skip the preset. <b>Pick the venues</b> I&apos;m allowed to use —
          I&apos;ll still rebalance for the best yield within your shortlist.
        </p>
      </div>
      <div className="text-right pr-[6px] max-[880px]:col-span-2 max-[880px]:text-left max-[880px]:pt-[6px] max-[880px]:border-t max-[880px]:border-line-1">
        <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4 mb-1">
          Eligible
        </div>
        <div className="font-mono [font-feature-settings:'tnum'] text-[18px] font-medium tracking-[-0.02em] text-silver-1">
          {liveVenueCount > 0 ? liveVenueCount : "—"} venue
          {liveVenueCount === 1 ? "" : "s"}
        </div>
      </div>
      <span className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-pill bg-white/[0.05] border border-line-2 text-[13px] font-medium tracking-[-0.005em] text-silver-1 transition-all group-hover:bg-white/[0.1] group-hover:border-line-3 max-[880px]:col-span-2 max-[880px]:justify-self-start">
        Pick markets
        <span className="inline-block transition-transform group-hover:translate-x-[3px]">
          →
        </span>
      </span>
    </Link>
  );
}
