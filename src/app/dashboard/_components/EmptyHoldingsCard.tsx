import Link from "next/link";

export function EmptyHoldingsCard({
  hasPolicy,
  hasFunds,
}: {
  hasPolicy: boolean;
  hasFunds: boolean;
}) {
  return (
    <section className="rounded-[20px] border border-line-2 bg-white/[0.03] backdrop-blur-xl p-6 text-center">
      <div className="font-display text-[16px] text-silver-1 mb-1.5">
        {hasFunds
          ? "USDC is in your smart account — but nothing is allocated yet."
          : "No funds and no allocations yet."}
      </div>
      <p className="m-0 text-[13px] text-silver-3 leading-[1.55] max-w-[520px] mx-auto">
        {!hasFunds && !hasPolicy ? (
          <>
            Fund your smart account above, then head to{" "}
            <Link href="/chat" className="text-silver-1 underline">
              Chat
            </Link>{" "}
            and tell Compass how you want it allocated.
          </>
        ) : !hasFunds ? (
          <>Fund your smart account above — your policy is ready to go.</>
        ) : !hasPolicy ? (
          <>
            Set a strategy in{" "}
            <Link href="/chat" className="text-silver-1 underline">
              Chat
            </Link>{" "}
            — your funds will get allocated on the next engine tick.
          </>
        ) : (
          <>
            Strategy is live but the engine hasn&apos;t allocated yet. The cron
            ticks every 15 minutes.
          </>
        )}
      </p>
    </section>
  );
}
