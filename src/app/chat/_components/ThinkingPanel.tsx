"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";

export function ThinkingPanel({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const [finalized, setFinalized] = useState(false);

  useEffect(() => {
    if (!streaming && text.length > 0 && !finalized) {
      setFinalized(true);
    }
  }, [streaming, text.length, finalized]);

  const defaultOpen = finalized ? false : streaming;
  const open = userOverride ?? defaultOpen;

  return (
    <div>
      <button
        type="button"
        onClick={() => setUserOverride(!open)}
        className="inline-flex items-center gap-1.5 text-steel hover:text-silver-2 transition-colors"
      >
        <Icon name="lightbulb" className="w-3 h-3" />
        <span className="text-[12px] font-medium">
          {streaming && !finalized ? "Thinking…" : "Thought"}
        </span>
        <Icon
          name="chevron-down"
          className={clsx(
            "w-3 h-3 transition-transform duration-300",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      <div
        className={clsx(
          "grid transition-all duration-300 ease-out",
          open
            ? "grid-rows-[1fr] opacity-100 mt-1.5"
            : "grid-rows-[0fr] opacity-0 mt-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pl-4 border-l border-line-1 font-mono text-[11.5px] leading-[1.6] text-silver-4 whitespace-pre-wrap max-h-[76px] overflow-y-auto">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
