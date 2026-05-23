import type { ReactNode } from "react";
import clsx from "clsx";

export function SectionHead({
  n,
  label,
  tag,
  mint,
}: {
  n: string;
  label: string;
  tag?: string;
  mint?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-[10px] pb-1">
      <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-silver-4">
        {n}
      </span>
      <span
        className={clsx(
          "font-mono text-[10px] font-semibold tracking-[0.16em] uppercase",
          mint ? "text-mint" : "text-silver-2",
        )}
      >
        {label}
      </span>
      {tag ? (
        <span className="ml-auto font-mono text-[9px] tracking-[0.14em] uppercase font-medium px-2 py-[3px] rounded-pill border border-line-2 text-silver-3">
          {tag}
        </span>
      ) : null}
    </div>
  );
}

export function Field({ k, v }: { k: string; v: string }) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-[2px] pl-[22px] border-l border-line-1",
        "max-[880px]:pl-0 max-[880px]:border-l-0 max-[880px]:pt-[6px] max-[880px]:border-t max-[880px]:border-line-1 max-[880px]:col-span-2 max-[880px]:flex-row max-[880px]:gap-2 max-[880px]:items-center",
      )}
    >
      <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
        {k}
      </span>
      <span className="font-mono text-[13px] font-medium tracking-[-0.005em] text-silver-1">
        {v}
      </span>
    </div>
  );
}

export function Line({
  k,
  v,
  mint,
}: {
  k: string;
  v: ReactNode;
  mint?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-[12.5px]">
      <span className="text-silver-4">{k}</span>
      <span
        className={clsx(
          "font-mono font-medium",
          mint ? "text-mint" : "text-silver-1",
        )}
      >
        {v}
      </span>
    </div>
  );
}
