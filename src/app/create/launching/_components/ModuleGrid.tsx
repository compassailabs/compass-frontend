import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import type { ModuleDef } from "./timeline";
import type { State } from "./state";

export function ModuleGrid({
  modules,
  state,
}: {
  modules: ModuleDef[];
  state: State;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-[22px] max-[880px]:grid-cols-1">
      {modules.map((m) => {
        const done = state.done[m.key];
        return (
          <article
            key={m.key}
            className={clsx(
              "relative flex flex-col gap-[10px] pl-[22px] pr-[22px] pt-[18px] pb-[18px]",
              "rounded-[18px] border backdrop-blur-xl transition-all duration-[600ms]",
              done
                ? "opacity-100 border-mint/[0.3] bg-gradient-to-b from-mint/[0.06] to-mint/[0.012]"
                : "opacity-[0.55] border-line-1 bg-gradient-to-b from-white/[0.025] to-white/[0.006]",
            )}
          >
            <header className="flex justify-between items-center gap-[10px]">
              <div className="inline-flex items-center gap-[10px]">
                <span
                  className={clsx(
                    "w-8 h-8 rounded-[10px] border grid place-items-center transition-all duration-[600ms]",
                    "[&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-[1.7] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]",
                    done
                      ? "bg-mint/[0.12] border-mint/[0.35] text-mint"
                      : "bg-white/[0.04] border-line-2 text-silver-2",
                  )}
                >
                  {m.glyph}
                </span>
                <span
                  className={clsx(
                    "font-mono text-[10px] font-semibold tracking-[0.14em] uppercase",
                    "[&_b]:font-semibold",
                    done
                      ? "text-silver-3 [&_b]:text-silver-1"
                      : "text-silver-4 [&_b]:text-silver-2",
                  )}
                >
                  {m.label}
                </span>
              </div>
              <div
                className={clsx(
                  "inline-flex items-center gap-[6px] font-mono text-[10px] font-semibold tracking-[0.1em] uppercase",
                  done ? "text-mint" : "text-silver-4",
                )}
              >
                {done ? (
                  <Icon name="check" className="w-[14px] h-[14px] text-mint" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-[1.5px] border-line-3 border-t-silver-1 animate-spin-fast" />
                )}
                {state.status[m.key]}
              </div>
            </header>
            <div>
              <div className="font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.022em] text-silver-1">
                {m.name}
              </div>
              <div
                className={clsx(
                  "mt-1 text-[12.5px] leading-[1.45]",
                  done ? "text-silver-3" : "text-silver-4",
                )}
              >
                {m.desc}
              </div>
            </div>
            <div className="flex justify-between items-center gap-[10px] pt-[10px] mt-auto border-t border-dashed border-line-1 font-mono text-[11px] tracking-[0.04em]">
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
                {m.footK}
              </span>
              <span
                className={clsx(
                  "font-medium",
                  done ? "text-silver-1" : "text-silver-3",
                )}
              >
                {state.foot[m.key]}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
