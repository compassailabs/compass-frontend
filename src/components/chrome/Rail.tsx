"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import {
  STEP_SEQUENCE,
  STEP_NAMES,
  pad2,
  stepHref,
  type StepKey,
} from "@/lib/path";
import { useCompassStore } from "@/store/compass";

const STEP_FROM_PATH: Record<string, StepKey> = {
  "/create/strategy": "strategy",
  "/create/deposit": "deposit",
  "/create/markets": "markets",
  "/create/review": "review",
  "/create/launching": "launching",
};

const stepLinkBase =
  "relative grid grid-cols-[28px_1fr_auto] gap-3 items-center px-3 py-[11px] " +
  "no-underline rounded-[10px] transition-all duration-[180ms]";

const stepClickable =
  "text-silver-3 hover:bg-white/[0.03] hover:text-silver-1 cursor-pointer";

const stepLocked =
  "text-silver-5 cursor-not-allowed opacity-60";

export function Rail() {
  const pathname = usePathname();
  const path = useCompassStore((s) => s.path);
  const current = STEP_FROM_PATH[pathname];
  const seq = STEP_SEQUENCE[path];
  const currentIdx = current ? seq.indexOf(current) : -1;

  return (
    <aside
      className={clsx(
        "flex flex-col h-full pl-6 pr-4 pt-[26px] pb-[22px] overflow-y-auto",
        "border-r border-line-1 bg-[rgba(10,20,40,0.4)] backdrop-blur-md",
      )}
    >
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-silver-4 font-medium mb-[14px]">
        Create Compass
      </div>

      <nav className="flex flex-col gap-[2px]">
        {seq.map((k, i) => {
          const isCurrent = i === currentIdx;
          const isDone = currentIdx >= 0 && i < currentIdx;
          const isLocked = !isCurrent && !isDone;

          const inner = (
            <>
              <span
                className={clsx(
                  "font-mono text-[11px] tracking-[0.04em] font-medium text-center text-silver-4",
                  isCurrent && "!text-silver-1",
                  isDone && "!text-mint",
                )}
              >
                {pad2(i + 1)}
              </span>
              <span className="font-display text-[14px] font-medium tracking-[-0.012em]">
                {STEP_NAMES[k]}
              </span>
              <svg
                viewBox="0 0 24 24"
                className={clsx(
                  "w-[14px] h-[14px] fill-none stroke-mint stroke-2 [stroke-linecap:round] [stroke-linejoin:round] opacity-0 transition-opacity",
                  isDone && "opacity-100 stroke-[2.4]",
                )}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </>
          );

          const className = clsx(
            stepLinkBase,
            isLocked ? stepLocked : stepClickable,
            isCurrent && "bg-white/[0.045] text-silver-1 step-bar-current",
            isDone &&
              "bg-mint/[0.07] hover:bg-mint/[0.12] step-bar-done text-silver-2",
          );

          if (isLocked) {
            return (
              <span
                key={k}
                className={className}
                aria-disabled
                title="Finish the current step first"
              >
                {inner}
              </span>
            );
          }
          return (
            <Link key={k} href={stepHref(k, path)} className={className}>
              {inner}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
