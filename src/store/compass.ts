"use client";

import { create } from "zustand";
import type { CompassPath } from "@/lib/path";

export type ChainKey =
  | "arc"
  | "base"
  | "ethereum"
  | "arbitrum"
  | "polygon"
  | "optimism"
  | "avalanche";

export type StrategyKey = "conservative" | "balanced" | "growth";

export interface CompassState {
  path: CompassPath;
  strategy: StrategyKey;
  amount: number;
  chain: ChainKey;
  markets: string[];

  setPath: (p: CompassPath) => void;
  setStrategy: (s: StrategyKey) => void;
  setAmount: (a: number) => void;
  setChain: (c: ChainKey) => void;
  toggleMarket: (id: string) => void;
  setMarkets: (ids: string[]) => void;
}

export const useCompassStore = create<CompassState>((set) => ({
  path: "preset",
  strategy: "balanced",
  amount: 50,
  chain: "arc",
  markets: [],

  setPath: (path) => set({ path }),
  setStrategy: (strategy) => set({ strategy }),
  setAmount: (amount) => set({ amount }),
  setChain: (chain) => set({ chain }),
  toggleMarket: (id) =>
    set((s) => ({
      markets: s.markets.includes(id)
        ? s.markets.filter((m) => m !== id)
        : [...s.markets, id],
    })),
  setMarkets: (markets) => set({ markets }),
}));
