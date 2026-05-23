"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import clsx from "clsx";

import { setupSession } from "@/lib/api";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

/**
 * One-time on-chain bootstrap dialog. Triggered from the AppHeader
 * "Setup session" pill when `session.ready === false`. Calls the
 * backend `/session/:user/setup` which:
 *   1. deploys the user's Diamond on Arc + Arbitrum Sepolia (CREATE2 with
 *      `salt = 0` — same address on both chains)
 *   2. registers the agent's session key with a 24-hour expiry,
 *      scoped to the AAVE supply/withdraw and Gateway deposit/withdraw
 *      selectors only
 */
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

  async function onSetup() {
    if (!address) {
      toast.error("Connect a wallet first.");
      return;
    }
    setRunning(true);
    try {
      const result = await setupSession(address);
      toast.success(
        `Session active. Compass account: ${result.status.arc.address.slice(
          0,
          10,
        )}…`,
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
        aria-label="Set up Compass session"
        className={clsx(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]",
          "w-[520px] max-w-[92vw] rounded-[20px] border border-line-2",
          "bg-gradient-to-b from-[#0E1A33] to-arc-deep p-6 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
              One-time setup
            </div>
            <h2 className="font-display text-[20px] font-semibold text-silver-1 m-0 leading-[1.2]">
              Set up your Compass session
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
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <p className="text-[13.5px] text-silver-3 leading-[1.55] mb-4">
          Compass needs a one-time on-chain bootstrap before it can act on
          your behalf. This deploys your smart account and grants the agent
          a tightly-scoped, 24-hour session key.
        </p>

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
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3 h-3 fill-none stroke-current stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
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
            Later
          </button>
          <button
            type="button"
            onClick={onSetup}
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
            {running ? "Setting up…" : session?.ready ? "Refresh" : "Set up session"}
          </button>
        </footer>
      </div>
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[14px_1fr] gap-[10px] items-start text-[13px] text-silver-2 leading-[1.5]">
      <svg
        viewBox="0 0 24 24"
        className="w-[14px] h-[14px] mt-[3px] fill-none stroke-mint stroke-[2.2] [stroke-linecap:round] [stroke-linejoin:round]"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
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
