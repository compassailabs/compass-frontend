"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";

import {
  CHAIN_FILTERS,
  PROTOCOL_FILTERS,
  type ChainFilter,
  type ProtocolFilter,
} from "./types";

const filterPillBase =
  "inline-flex items-center gap-[6px] px-3 py-[6px] rounded-pill " +
  "border text-[12px] tracking-[-0.005em] cursor-pointer transition-all duration-[150ms]";

export function Filters({
  chainFilter,
  setChainFilter,
  protocolFilter,
  setProtocolFilter,
  search,
  setSearch,
}: {
  chainFilter: ChainFilter;
  setChainFilter: (f: ChainFilter) => void;
  protocolFilter: ProtocolFilter;
  setProtocolFilter: (f: ProtocolFilter) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-[14px] mb-[14px] max-[880px]:grid-cols-1">
      <div className="flex items-center gap-[14px] flex-wrap">
        <FilterGroup label="Chain">
          {CHAIN_FILTERS.map((c) => (
            <button
              key={c.f}
              type="button"
              onClick={() => setChainFilter(c.f)}
              className={clsx(
                filterPillBase,
                chainFilter === c.f
                  ? "bg-white/[0.08] border-silver-3 text-silver-1"
                  : "bg-white/[0.025] border-line-1 text-silver-3 hover:bg-white/[0.05] hover:border-line-2 hover:text-silver-1",
              )}
            >
              {c.icon ? (
                <img src={c.icon} alt="" aria-hidden className="w-3.5 h-3.5" />
              ) : null}
              {c.label}
            </button>
          ))}
        </FilterGroup>
        <FilterGroup label="Protocol">
          {PROTOCOL_FILTERS.map((p) => (
            <button
              key={p.f}
              type="button"
              onClick={() => setProtocolFilter(p.f)}
              className={clsx(
                filterPillBase,
                protocolFilter === p.f
                  ? "bg-white/[0.08] border-silver-3 text-silver-1"
                  : "bg-white/[0.025] border-line-1 text-silver-3 hover:bg-white/[0.05] hover:border-line-2 hover:text-silver-1",
              )}
            >
              {p.label}
            </button>
          ))}
        </FilterGroup>
      </div>
      <label className="inline-flex items-center gap-[9px] px-[14px] py-[9px] rounded-pill bg-white/[0.04] border border-line-2 min-w-[220px] max-[880px]:min-w-0">
        <Icon name="search" className="w-[13px] h-[13px] text-silver-4" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search markets"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 w-full bg-transparent border-0 outline-none text-[12.5px] text-silver-2 placeholder:text-silver-4"
        />
        <kbd className="font-mono text-[9px] px-[5px] py-[2px] rounded border border-line-2 bg-white/[0.05] text-silver-4">
          /
        </kbd>
      </label>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 pr-[14px] border-r border-line-1 last:border-r-0 last:pr-0">
      <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-silver-4 pr-1">
        {label}
      </span>
      <div className="inline-flex gap-1 flex-wrap">{children}</div>
    </div>
  );
}
