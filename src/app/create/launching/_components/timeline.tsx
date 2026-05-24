import type { ReactNode } from "react";

import { Icon } from "@/components/visuals/Icon";
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
    { key: "vault", label: <>Module <b>01</b> · Smart account</>, name: "Non-custodial smart account", desc: "Same address on Arc and Arbitrum Sepolia.", footK: "Address", glyph: <Icon name="map-pin" className="w-full h-full" /> },
    { key: "deposit", label: <>Module <b>02</b> · Deposit</>, name: i.depositLabel, desc: `Transferred from ${i.walletShort}.`, footK: "Settled in", glyph: <Icon name="arrow-down" className="w-full h-full" /> },
    { key: "gateway", label: <>Module <b>03</b> · Gateway</>, name: "Circle Gateway", desc: "Cross-chain routing between Arc and Arbitrum Sepolia.", footK: "Chains", glyph: <Icon name="globe" className="w-full h-full" /> },
    { key: "router", label: <>Module <b>04</b> · AI Router</>, name: `${i.liveVenueCount} venue${i.liveVenueCount === 1 ? "" : "s"} active`, desc: "Engine ticks every 15 minutes.", footK: "Blended APR", glyph: <Icon name="router" className="w-full h-full" /> },
  ];
}
