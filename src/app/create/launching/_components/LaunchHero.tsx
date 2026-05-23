import clsx from "clsx";

import { StarMark } from "@/components/visuals/StarMark";

export function LaunchHero({
  live,
  heroStatus,
}: {
  live: boolean;
  heroStatus: string;
}) {
  return (
    <section
      className={clsx(
        "relative overflow-hidden grid grid-cols-[auto_1fr_auto] gap-8 items-center",
        "pl-9 pr-9 pt-8 pb-8 mb-[22px] rounded-3xl border backdrop-blur-xl",
        "transition-all duration-[800ms]",
        live
          ? "border-mint/[0.35] bg-gradient-to-b from-mint/[0.06] to-mint/[0.012] shadow-[0_40px_100px_-30px_rgba(127,223,183,0.25)]"
          : "border-line-2 bg-gradient-to-b from-white/[0.04] to-white/[0.012]",
        "max-[880px]:grid-cols-1 max-[880px]:text-center max-[880px]:gap-[18px] max-[880px]:pl-[22px] max-[880px]:pr-[22px] max-[880px]:pt-[26px] max-[880px]:pb-[26px]",
      )}
    >
      <StarMark
        onClick={() => window.location.reload()}
        className={clsx(
          "w-[92px] h-[92px] cursor-pointer transition-[filter] duration-[800ms]",
          "max-[880px]:mx-auto",
          live
            ? "animate-spin-very-slow drop-shadow-[0_0_36px_rgba(127,223,183,0.4)]"
            : "animate-spin-slow drop-shadow-[0_0_32px_rgba(255,255,255,0.22)]",
        )}
      />
      <div className="flex flex-col gap-[10px]">
        <span
          className={clsx(
            "self-start inline-flex items-center gap-[9px] px-3 py-[5px] rounded-pill border",
            "font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-all duration-[600ms]",
            "max-[880px]:self-center",
            live
              ? "bg-mint/[0.1] border-mint/[0.35] text-mint"
              : "bg-amber/[0.08] border-amber/[0.25] text-amber",
          )}
        >
          <span
            className={clsx(
              "w-[6px] h-[6px] rounded-full",
              live
                ? "bg-mint animate-mint-pulse"
                : "bg-amber animate-amber-pulse",
            )}
          />
          {heroStatus}
        </span>
        {live ? (
          <h1 className="m-0 font-display font-semibold leading-[1.05] tracking-[-0.035em] text-silver-1 text-[clamp(28px,3.4vw,40px)] [&_em]:not-italic [&_em]:bg-gradient-to-b [&_em]:from-mint [&_em]:to-[#5EBA94] [&_em]:bg-clip-text [&_em]:text-transparent">
            Your Compass is <em>live.</em>
          </h1>
        ) : (
          <h1 className="m-0 font-display font-semibold leading-[1.05] tracking-[-0.035em] text-silver-1 text-[clamp(28px,3.4vw,40px)] [&_em]:not-italic [&_em]:bg-gradient-to-b [&_em]:from-silver-2 [&_em]:to-silver-4 [&_em]:bg-clip-text [&_em]:text-transparent">
            Booting your Compass <em>onto Arc.</em>
          </h1>
        )}
        <div className="mt-1 font-mono text-[12px] tracking-[0.04em] text-silver-3">
          Compass ·{" "}
          <b
            className={clsx(
              "font-semibold",
              live ? "text-mint" : "text-silver-1",
            )}
          >
            cmps_5n9k4r2x
          </b>
          {live ? (
            <>
              {" · routing 2,500 USDC at "}
              <b className="font-semibold text-mint">6.42% APR</b>
            </>
          ) : (
            <> · 2,500 USDC · Balanced</>
          )}
        </div>
      </div>
      <a
        href="/dashboard"
        className={clsx(
          "group inline-flex items-center gap-[9px] px-6 py-[13px] rounded-pill",
          "no-underline whitespace-nowrap font-semibold text-[14px] tracking-[-0.005em]",
          "bg-gradient-to-b from-white to-silver-2 text-arc-deep",
          "shadow-[0_10px_30px_-10px_rgba(226,232,240,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]",
          "transition-all duration-[600ms] ease-in-out",
          live
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-2 pointer-events-none",
        )}
      >
        Open dashboard
        <span className="inline-block transition-transform group-hover:translate-x-[3px]">
          →
        </span>
      </a>
    </section>
  );
}
