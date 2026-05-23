import clsx from "clsx";

import type { FlightLine } from "./state";

export function FlightRecorder({ lines }: { lines: FlightLine[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line-2 bg-black/[0.32] backdrop-blur-xl">
      <header className="flex justify-between items-center px-[18px] py-[11px] border-b border-line-1 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-silver-4">
        <span className="inline-flex items-center gap-2 text-silver-3">
          Flight recorder ·{" "}
          <b className="text-silver-1 font-semibold">cmps_5n9k4r2x</b>
        </span>
        <span className="inline-flex items-center gap-[6px] text-mint">
          <i className="w-[5px] h-[5px] rounded-full bg-mint" />
          Live
        </span>
      </header>
      <div className="pl-[18px] pr-[18px] pt-1 pb-3 max-h-[184px] overflow-hidden font-mono text-[12px] max-[880px]:text-[11px]">
        {lines.map((l) => (
          <FlightRow key={l.id} line={l} />
        ))}
      </div>
    </section>
  );
}

function FlightRow({ line: l }: { line: FlightLine }) {
  return (
    <div className="grid grid-cols-[64px_16px_1fr_auto] gap-[14px] items-center py-[6px] border-b border-dotted border-line-1 last:border-b-0 animate-flight-line max-[880px]:grid-cols-[56px_14px_1fr] max-[880px]:gap-[10px]">
      <span className="text-silver-5 tracking-[0.02em] [font-feature-settings:'tnum']">
        {l.ts}
      </span>
      <span
        className={clsx(
          "w-[14px] h-[14px] grid place-items-center",
          "[&_svg]:w-3 [&_svg]:h-3 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:[stroke-width:2.4] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]",
          l.glyph === "run"
            ? "text-silver-2 [&_svg]:animate-spin-fast"
            : "text-mint",
        )}
      >
        {l.glyph === "ok" ? (
          <svg viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        )}
      </span>
      <span className="text-silver-2 tracking-[0.01em] [&_b]:text-silver-1 [&_b]:font-semibold">
        {l.msg}
      </span>
      {l.ms ? (
        <span
          className={clsx(
            "text-[11px] max-[880px]:hidden",
            l.live ? "text-mint" : "text-silver-5",
          )}
        >
          {l.ms}
        </span>
      ) : null}
    </div>
  );
}
