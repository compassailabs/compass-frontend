import type { ReactNode } from "react";

export type ModuleKey = "vault" | "deposit" | "gateway" | "router";

export type FlightLine = {
  id: number;
  ts: string;
  glyph: "ok" | "run";
  msg: ReactNode;
  ms?: string;
  live?: boolean;
};

export interface State {
  done: Record<ModuleKey, boolean>;
  status: Record<ModuleKey, string>;
  foot: Record<ModuleKey, string>;
  lines: FlightLine[];
  live: boolean;
  heroStatus: string;
}

export const INITIAL: State = {
  done: { vault: false, deposit: false, gateway: false, router: false },
  status: {
    vault: "Deploying",
    deposit: "Awaiting",
    gateway: "Connecting",
    router: "Calibrating",
  },
  foot: {
    vault: "—",
    deposit: "— ms",
    gateway: "—",
    router: "— %",
  },
  lines: [],
  live: false,
  heroStatus: "Launching",
};

export type Action =
  | { kind: "addLine"; line: Omit<FlightLine, "id"> }
  | { kind: "activate"; module: ModuleKey; statusText: string; foot: string }
  | { kind: "setHeroStatus"; text: string }
  | { kind: "goLive" };

let lineCounter = 0;

export function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "addLine": {
      const id = ++lineCounter;
      const next = [...state.lines, { id, ...action.line }];
      return { ...state, lines: next.slice(-6) };
    }
    case "activate":
      return {
        ...state,
        done: { ...state.done, [action.module]: true },
        status: { ...state.status, [action.module]: action.statusText },
        foot: { ...state.foot, [action.module]: action.foot },
      };
    case "setHeroStatus":
      return { ...state, heroStatus: action.text };
    case "goLive":
      return { ...state, live: true, heroStatus: "Live" };
  }
}

export type Submission =
  | { state: "pending" }
  | { state: "success"; version: number }
  | { state: "error"; message: string };
