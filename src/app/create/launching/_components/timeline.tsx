import type { ReactNode } from "react";

import type { FlightLine, ModuleKey } from "./state";

export type TimelineInputs = {
  walletShort: string;
  smartAccountShort: string;
  depositLabel: string;
  liveVenueCount: number;
  liveVenueCountStr: string;
  allocPctsStr: string;
  blendedAprStr: string;
};

export interface TimelineStep {
  at: number;
  line?: Omit<FlightLine, "id">;
  activate?: { module: ModuleKey; statusText: string; foot: string };
  heroStatus?: string;
  goLive?: true;
}

export function buildTimeline(i: TimelineInputs): TimelineStep[] {
  return [
    { at: 320, line: { ts: "00:00.318", glyph: "ok", msg: <>Signature confirmed · wallet <b>{i.walletShort}</b></>, ms: "318 ms", live: true } },
    { at: 720, heroStatus: "Booting smart account", line: { ts: "00:00.704", glyph: "ok", msg: <>Compass smart account on Arc · <b>{i.smartAccountShort}</b></>, ms: "386 ms", live: true }, activate: { module: "vault", statusText: "Online", foot: i.smartAccountShort } },
    { at: 1280, line: { ts: "00:01.215", glyph: "run", msg: <>Awaiting deposit settlement…</>, ms: "…" } },
    { at: 1900, heroStatus: "Settling deposit", line: { ts: "00:01.918", glyph: "ok", msg: <>Deposit settled · <b>{i.depositLabel}</b> in Compass account</>, ms: "487 ms", live: true }, activate: { module: "deposit", statusText: "Settled", foot: "487 ms" } },
    { at: 2500, line: { ts: "00:02.466", glyph: "run", msg: <>Connecting Circle Gateway…</>, ms: "…" } },
    { at: 3100, heroStatus: "Wiring routes", line: { ts: "00:03.082", glyph: "ok", msg: <>Gateway online · <b>Arc + Arbitrum Sepolia</b> reachable</>, ms: "616 ms", live: true }, activate: { module: "gateway", statusText: "Online", foot: "Arc + Arb" } },
    { at: 3650, line: { ts: "00:03.644", glyph: "run", msg: <>Routing capital · {i.liveVenueCountStr} · diversification rules…</>, ms: "…" } },
    { at: 4400, heroStatus: "Activating router", line: { ts: "00:04.391", glyph: "ok", msg: <>Allocation locked · <b>{i.allocPctsStr}</b> · APR <b>{i.blendedAprStr}</b></>, ms: "747 ms", live: true }, activate: { module: "router", statusText: "Active", foot: i.blendedAprStr } },
    { at: 4900, line: { ts: "00:04.872", glyph: "ok", msg: <>AI Router <b>active</b> · watching for rebalances</>, ms: "live", live: true } },
    { at: 5300, goLive: true },
  ];
}

export interface ModuleDef {
  key: ModuleKey;
  label: ReactNode;
  name: string;
  desc: string;
  footK: string;
  glyph: ReactNode;
}

export function buildModules(i: TimelineInputs): ModuleDef[] {
  return [
    { key: "vault", label: <>Module <b>01</b> · Smart account</>, name: "Non-custodial smart account", desc: "Same address on Arc and Arbitrum Sepolia.", footK: "Address", glyph: <svg viewBox="0 0 24 24"><path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z" /><circle cx="12" cy="9" r="3" /></svg> },
    { key: "deposit", label: <>Module <b>02</b> · Deposit</>, name: i.depositLabel, desc: `Transferred from ${i.walletShort}.`, footK: "Settled in", glyph: <svg viewBox="0 0 24 24"><path d="M12 2v20M5 12l7 7 7-7" /></svg> },
    { key: "gateway", label: <>Module <b>03</b> · Gateway</>, name: "Circle Gateway", desc: "Cross-chain routing between Arc and Arbitrum Sepolia.", footK: "Chains", glyph: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg> },
    { key: "router", label: <>Module <b>04</b> · AI Router</>, name: `${i.liveVenueCount} venue${i.liveVenueCount === 1 ? "" : "s"} active`, desc: "Engine ticks every 15 minutes.", footK: "Blended APR", glyph: <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" /><circle cx="12" cy="12" r="3" /></svg> },
  ];
}
