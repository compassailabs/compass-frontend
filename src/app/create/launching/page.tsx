"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { useCompassStore } from "@/store/compass";
import { useUserStateStore } from "@/store/userState";
import {
  compilePolicyFromWizard,
  getMarkets,
  putPolicy,
  venueKey,
  type MarketEntry,
} from "@/lib/api";

import { FlightRecorder } from "./_components/FlightRecorder";
import { LaunchHero } from "./_components/LaunchHero";
import { ModuleGrid } from "./_components/ModuleGrid";
import { SubmissionBanner } from "./_components/SubmissionBanner";
import { INITIAL, reducer, type Submission } from "./_components/state";
import {
  buildModules,
  buildTimeline,
  type TimelineInputs,
} from "./_components/timeline";

/**
 * Launching orchestrator. Runs two parallel things:
 *   1. **Real policy commit** — `compilePolicyFromWizard` → `putPolicy`.
 *      The result drives the SubmissionBanner.
 *   2. **Cinematic timeline** — pre-scripted `setTimeout`s that fill
 *      in the flight recorder + module grid + hero status as the user
 *      watches. Mostly cosmetic; reflects the wizard's *real* numbers
 *      (wallet, smart account, deposit, allocation, APR).
 *
 * Sub-components live in `_components/`. State / reducer / timeline
 * script live alongside as `state.ts` + `timeline.tsx`.
 */
export default function LaunchingPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { address, isConnected } = useAccount();
  const strategy = useCompassStore((s) => s.strategy);
  const amount = useCompassStore((s) => s.amount);
  const selectedKeys = useCompassStore((s) => s.markets);
  const balance = useUserStateStore((s) => s.balance);
  const [submission, setSubmission] = useState<Submission>({ state: "pending" });
  const [markets, setMarkets] = useState<MarketEntry[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        setMarkets(markets);
      } catch {
        // ignore — timeline will fall back to "—" APR
      }
    })();
    return () => ac.abort();
  }, []);

  // Real backend submission, runs in parallel with the cosmetic timeline.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isConnected || !address) {
        if (!cancelled) {
          setSubmission({
            state: "error",
            message: "Connect a wallet before deploying.",
          });
          toast.error("Connect a wallet before deploying.");
        }
        return;
      }
      try {
        const policy = compilePolicyFromWizard({ user: address, strategy });
        const { version } = await putPolicy(address, policy);
        if (!cancelled) {
          setSubmission({ state: "success", version });
          toast.success(`Policy v${version} committed · engine engaged`);
        }
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Submission failed.";
        setSubmission({ state: "error", message });
        toast.error(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected, strategy]);

  // Build the timeline inputs from real wizard + on-chain state. Memo
  // so the timer effect doesn't re-arm every render.
  const inputs: TimelineInputs = useMemo(() => {
    const walletShort = address
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : "wallet";
    const sa = balance?.smart_account ?? null;
    const smartAccountShort = sa
      ? `${sa.slice(0, 6)}…${sa.slice(-4)}`
      : "deploys on sign";
    const depositLabel = `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} USDC`;
    const selectedMarkets = markets.filter((m) =>
      selectedKeys.includes(venueKey(m)),
    );
    const yieldVenues = selectedMarkets.filter((m) => m.is_yield_venue);
    const blendedApr =
      yieldVenues.length === 0
        ? 0
        : yieldVenues.reduce((s, m) => s + m.apr, 0) / yieldVenues.length;
    const allocPctsStr =
      selectedMarkets.length === 0
        ? "—"
        : yieldVenues.length > 0
          ? Array(yieldVenues.length)
              .fill(Math.round(100 / yieldVenues.length))
              .join("/") + "%"
          : Array(selectedMarkets.length)
              .fill(Math.round(100 / selectedMarkets.length))
              .join("/") + "%";
    return {
      walletShort,
      smartAccountShort,
      depositLabel,
      liveVenueCount: selectedMarkets.length,
      liveVenueCountStr: `${selectedMarkets.length} venue${selectedMarkets.length === 1 ? "" : "s"}`,
      allocPctsStr,
      blendedAprStr:
        markets.length === 0 ? "—" : `${(blendedApr * 100).toFixed(2)}%`,
    };
  }, [address, balance, amount, selectedKeys, markets]);

  const timeline = useMemo(() => buildTimeline(inputs), [inputs]);
  const modules = useMemo(() => buildModules(inputs), [inputs]);

  useEffect(() => {
    const timers = timeline.map((step) =>
      window.setTimeout(() => {
        if (step.line) dispatch({ kind: "addLine", line: step.line });
        if (step.activate) dispatch({ kind: "activate", ...step.activate });
        if (step.heroStatus)
          dispatch({ kind: "setHeroStatus", text: step.heroStatus });
        if (step.goLive) dispatch({ kind: "goLive" });
      }, step.at),
    );
    return () => timers.forEach(window.clearTimeout);
    // Timeline only plays once on mount; even if `inputs` change later
    // (e.g. balance refresh), restarting the cinematic would be jarring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SubmissionBanner submission={submission} />
      <LaunchHero live={state.live} heroStatus={state.heroStatus} />
      <ModuleGrid modules={modules} state={state} />
      <FlightRecorder lines={state.lines} />
    </div>
  );
}
