"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import { setupSession } from "@/lib/api";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

type Mode = "notSet" | "active" | "expired";

export function SessionSetupModal() {
  const open = useUIStore((s) => s.sessionModalOpen);
  const close = useUIStore((s) => s.closeSessionModal);
  const { address, isConnected } = useAccount();
  const session = useUserStateStore((s) => s.session);
  const refresh = useUserStateStore((s) => s.refresh);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !running) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, running, close]);

  if (!open) return null;

  async function onPrimary() {
    if (!address) {
      toast.error("Connect a wallet first.");
      return;
    }
    setRunning(true);
    try {
      const result = await setupSession(address);
      toast.success(
        `Session ${mode === "notSet" ? "active" : "renewed"}. Compass account: ${result.status.arc.address.slice(0, 10)}…`,
      );
      await refresh();
      close();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed.");
    } finally {
      setRunning(false);
    }
  }

  const arc = session?.arc;
  const arb = session?.arbitrum_sepolia;
  const sameAddress = session?.addresses_match ?? false;

  const nowSec = Math.floor(Date.now() / 1000);
  const expiresAt = session
    ? Math.min(
        session.arc.session_expires_at || Infinity,
        session.arbitrum_sepolia.session_expires_at || Infinity,
      )
    : Infinity;
  const remainingSec = expiresAt - nowSec;

  const mode: Mode = !session?.ready
    ? "notSet"
    : remainingSec <= 0
      ? "expired"
      : "active";

  const copy = COPY[mode];
  const introText =
    mode === "active"
      ? `Active — expires in ${formatRemaining(remainingSec)}. Compass can rebalance USDC across your whitelisted venues without prompting you each time.`
      : copy.intro;

  return (
    <>
      <div
        onClick={() => {
          if (!running) close();
        }}
        aria-hidden
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label="Compass session"
        className={clsx(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]",
          "w-[520px] max-w-[92vw] rounded-[20px] border border-line-2",
          "bg-gradient-to-b from-[#0E1A33] to-arc-deep p-6 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div
              className={clsx(
                "font-mono text-[10px] tracking-[0.14em] uppercase mb-1 inline-flex items-center gap-1.5",
                copy.eyebrowClass,
              )}
            >
              <i
                className={clsx(
                  "w-[6px] h-[6px] rounded-full",
                  copy.dotClass,
                )}
              />
              {copy.eyebrow}
            </div>
            <h2 className="font-display text-[20px] font-semibold text-silver-1 m-0 leading-[1.2]">
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!running) close();
            }}
            disabled={running}
            aria-label="Close"
            className="w-7 h-7 rounded-full border border-line-2 text-silver-3 hover:text-silver-1 hover:border-line-3 grid place-items-center disabled:opacity-40"
          >
            <Icon name="close" className="w-3.5 h-3.5" />
          </button>
        </header>

        <p className="text-[13.5px] text-silver-3 leading-[1.55] mb-4">
          {introText}
        </p>

        {mode === "notSet" && (
          <ul className="flex flex-col gap-2 mb-4 text-[12.5px] text-silver-2">
            <Bullet>
              Deploys your <b className="text-silver-1">Compass account</b> on
              Arc and Arbitrum Sepolia — same address on both chains
            </Bullet>
            <Bullet>
              Registers an agent session key valid for{" "}
              <b className="text-silver-1">24 hours</b>
            </Bullet>
            <Bullet>
              Permissions restricted to{" "}
              <b className="text-silver-1">AAVE supply/withdraw</b> and{" "}
              <b className="text-silver-1">Gateway deposit/withdraw</b> — agent
              cannot move funds anywhere else
            </Bullet>
            <Bullet>
              Revoke any time from the Strategy panel (one signature)
            </Bullet>
          </ul>
        )}

        {mode !== "notSet" && (
          <div className="mb-4 rounded-[12px] border border-line-1 bg-black/20 p-3 text-[11.5px] text-silver-3 leading-[1.55]">
            Agent is scoped to <b className="text-silver-1">AAVE supply/withdraw</b> and{" "}
            <b className="text-silver-1">Gateway deposit/withdraw</b> only. Renewing
            re-signs the same scope for another 24 hours.
          </div>
        )}

        {arc && arb && (
          <div className="mb-5 rounded-[14px] border border-line-2 bg-black/30 p-4 flex flex-col gap-3">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
              Your Compass account
            </div>
            {sameAddress ? (
              <div>
                <div className="font-mono text-[12.5px] text-silver-1 break-all">
                  {arc.address}
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-mono text-mint">
                  <Icon name="check" className="w-3 h-3" />
                  Same address on Arc and Arbitrum Sepolia
                </div>
              </div>
            ) : (
              <>
                <ChainRow label="Arc" status={arc} />
                <ChainRow label="Arbitrum Sepolia" status={arb} />
                <div className="text-[10px] font-mono text-amber">
                  ⚠ Addresses differ — factory deployments don&apos;t share
                  bytecode/deployer; check contract setup.
                </div>
              </>
            )}
            <div className="flex justify-between text-[11px] font-mono text-silver-4 border-t border-line-1 pt-2 mt-1">
              <span>
                Arc:{" "}
                <b
                  className={clsx(
                    "font-mono",
                    arc.deployed ? "text-mint" : "text-silver-3",
                  )}
                >
                  {arc.deployed ? "deployed" : "pending"}
                </b>{" "}
                ·{" "}
                <b
                  className={clsx(
                    "font-mono",
                    arc.session_valid ? "text-mint" : "text-silver-3",
                  )}
                >
                  {arc.session_valid ? "session active" : "no session"}
                </b>
              </span>
              <span>
                Arbitrum:{" "}
                <b
                  className={clsx(
                    "font-mono",
                    arb.deployed ? "text-mint" : "text-silver-3",
                  )}
                >
                  {arb.deployed ? "deployed" : "pending"}
                </b>{" "}
                ·{" "}
                <b
                  className={clsx(
                    "font-mono",
                    arb.session_valid ? "text-mint" : "text-silver-3",
                  )}
                >
                  {arb.session_valid ? "session active" : "no session"}
                </b>
              </span>
            </div>
          </div>
        )}

        <footer className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={running}
            className="px-4 py-2 rounded-pill border border-line-2 text-[13px] text-silver-3 hover:text-silver-1 hover:border-line-3 disabled:opacity-40 transition-colors"
          >
            {copy.dismissLabel}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={running || !isConnected}
            className={clsx(
              "inline-flex items-center gap-2 px-5 py-2 rounded-pill text-[13px] font-medium transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "bg-silver-2 text-arc-deep hover:bg-silver-1 active:scale-[0.98]",
            )}
          >
            {running && (
              <span className="w-3 h-3 rounded-full border-[1.5px] border-arc-deep border-t-transparent animate-spin-fast" />
            )}
            {running ? copy.runningLabel : copy.primaryLabel}
          </button>
        </footer>
      </div>
    </>
  );
}

const COPY: Record<
  Mode,
  {
    eyebrow: string;
    eyebrowClass: string;
    dotClass: string;
    title: string;
    intro: string;
    primaryLabel: string;
    runningLabel: string;
    dismissLabel: string;
  }
> = {
  notSet: {
    eyebrow: "One-time setup",
    eyebrowClass: "text-silver-4",
    dotClass: "bg-silver-4",
    title: "Set up your Compass session",
    intro:
      "Compass needs a one-time on-chain bootstrap before it can act on your behalf. This deploys your smart account and grants the agent a tightly-scoped, 24-hour session key.",
    primaryLabel: "Set up session",
    runningLabel: "Setting up…",
    dismissLabel: "Later",
  },
  active: {
    eyebrow: "Session active",
    eyebrowClass: "text-mint",
    dotClass: "bg-mint animate-mint-pulse",
    title: "Your Compass session",
    intro: "",
    primaryLabel: "Renew now",
    runningLabel: "Renewing…",
    dismissLabel: "Done",
  },
  expired: {
    eyebrow: "Session expired",
    eyebrowClass: "text-amber",
    dotClass: "bg-amber animate-amber-pulse",
    title: "Renew your Compass session",
    intro:
      "Your session key has expired. Compass can't rebalance or act on your behalf until you re-sign — it takes one transaction.",
    primaryLabel: "Renew session",
    runningLabel: "Renewing…",
    dismissLabel: "Later",
  },
};

function formatRemaining(sec: number): string {
  if (sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h >= 1) return `${h}h ${m}m`;
  return `${m}m`;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[14px_1fr] gap-[10px] items-start text-[13px] text-silver-2 leading-[1.5]">
      <Icon name="check" className="w-[14px] h-[14px] mt-[3px] text-mint" />
      <span>{children}</span>
    </li>
  );
}

function ChainRow({
  label,
  status,
}: {
  label: string;
  status: { address: string; deployed: boolean };
}) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-[11px] font-mono">
      <span className="text-silver-4">{label}</span>
      <span className="text-silver-1 break-all text-right">{status.address}</span>
    </div>
  );
}
