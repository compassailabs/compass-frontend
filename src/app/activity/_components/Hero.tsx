/**
 * Activity page hero — title + tagline + Thoughts / Moves big numbers.
 */
export function Hero({
  stats,
}: {
  stats: { thoughts: number; moves: number };
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
        Activity
      </div>
      <h1 className="m-0 font-display text-[36px] md:text-[44px] font-semibold tracking-[-0.022em] text-silver-1 leading-[1.05]">
        Compass thoughts
      </h1>
      <p className="m-0 text-[14px] text-silver-3 max-w-[640px] leading-[1.55]">
        Every check, decision and on-chain move the agent makes for you, in
        order. Quiet ticks where the portfolio was already optimal are
        collapsed so the timeline stays scannable.
      </p>
      <div className="flex items-center gap-8 mt-1">
        <StatPair label="Thoughts" value={stats.thoughts} />
        <StatPair label="Moves" value={stats.moves} />
      </div>
    </header>
  );
}

function StatPair({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
        {label}
      </span>
      <span className="font-display [font-feature-settings:'tnum'] text-[28px] font-semibold text-silver-1 leading-none">
        {value}
      </span>
    </div>
  );
}
