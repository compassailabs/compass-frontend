"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import { addressExplorerUrl } from "@/lib/explorers";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

export function SmartAccountCard() {
  const balance = useUserStateStore((s) => s.balance);
  const session = useUserStateStore((s) => s.session);
  const openFundModal = useUIStore((s) => s.openFundModal);
  const openWithdrawModal = useUIStore((s) => s.openWithdrawModal);
  const openSendToWalletModal = useUIStore((s) => s.openSendToWalletModal);
  const [copied, setCopied] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const explorerWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!explorerOpen) return;
    function onClick(e: MouseEvent) {
      if (!explorerWrapRef.current) return;
      if (!explorerWrapRef.current.contains(e.target as Node)) {
        setExplorerOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [explorerOpen]);

  const maybeAddr = balance?.smart_account ?? session?.arc.address;
  if (!maybeAddr) return null;
  const addr: string = maybeAddr;

  const arcExplorer = addressExplorerUrl("arc", addr);
  const arbExplorer = addressExplorerUrl("arbitrum_sepolia", addr);
  const balanceKnown = balance !== null;
  const empty = balanceKnown && !balance.has_funds;

  async function copy() {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <section
      className={clsx(
        "rounded-[20px] border p-6 backdrop-blur-xl",
        empty
          ? "border-amber/[0.35] bg-gradient-to-b from-amber/[0.08] to-amber/[0.02]"
          : "border-line-2 bg-gradient-to-b from-white/[0.05] to-white/[0.015]",
      )}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1.5">
            Your Compass smart account
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[14px] text-silver-1 break-all">
              {addr}
            </span>
            <button
              type="button"
              onClick={copy}
              className={clsx(
                "shrink-0 px-2.5 py-1 rounded-pill border text-[11px] transition-colors",
                copied
                  ? "border-mint/[0.4] text-mint"
                  : "border-line-2 text-silver-2 hover:text-silver-1 hover:border-line-3",
              )}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <div ref={explorerWrapRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setExplorerOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={explorerOpen}
                className="px-2.5 py-1 rounded-pill border border-line-2 text-[11px] text-silver-2 hover:text-silver-1 hover:border-line-3 transition-colors inline-flex items-center gap-1"
              >
                Explorer
                <Icon
                  name="chevron-down"
                  className={clsx(
                    "w-2.5 h-2.5 transition-transform",
                    explorerOpen && "rotate-180",
                  )}
                />
              </button>
              {explorerOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1.5 rounded-[10px] border border-line-2 bg-[#0E1A33] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] py-1 z-10 whitespace-nowrap"
                >
                  {arcExplorer && (
                    <a
                      href={arcExplorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setExplorerOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-silver-2 hover:text-silver-1 hover:bg-white/5"
                    >
                      <img
                        src="/icons/arc.svg"
                        alt=""
                        aria-hidden
                        className="w-4 h-4 shrink-0"
                      />
                      <span className="flex-1">Arcscan</span>
                      <span className="text-silver-4">↗</span>
                    </a>
                  )}
                  {arbExplorer && (
                    <a
                      href={arbExplorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setExplorerOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-silver-2 hover:text-silver-1 hover:bg-white/5"
                    >
                      <img
                        src="/icons/arbitrum.svg"
                        alt=""
                        aria-hidden
                        className="w-4 h-4 shrink-0"
                      />
                      <span className="flex-1">Arbiscan</span>
                      <span className="text-silver-4">↗</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openFundModal}
            className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-pill text-[13px] font-medium transition-all active:scale-[0.98]",
              empty
                ? "bg-amber text-arc-deep hover:bg-amber/90"
                : "bg-silver-2 text-arc-deep hover:bg-silver-1",
            )}
          >
            {empty ? "Deposit now" : "Deposit"}
          </button>
          {!empty && (
            <>
              <button
                type="button"
                onClick={openWithdrawModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-line-2 text-[13px] font-medium text-silver-2 hover:text-silver-1 hover:border-line-3 transition-all active:scale-[0.98]"
                title="Pull your AAVE position back to the Compass account on Arc (still earning-ready, not yet in your wallet)."
              >
                Unstake
              </button>
              <button
                type="button"
                onClick={openSendToWalletModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-line-2 text-[13px] font-medium text-silver-2 hover:text-silver-1 hover:border-line-3 transition-all active:scale-[0.98]"
                title="Send the Compass-on-Arc balance to your wallet. Unstake first if you have an AAVE position."
              >
                Withdraw
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <BalanceTile
          chainLabel="Arc"
          usdc={balance?.arc_usdc ?? null}
          chainDot="bg-silver-2"
        />
        <BalanceTile
          chainLabel="Arbitrum Sepolia"
          usdc={balance?.arbitrum_sepolia_usdc ?? null}
          chainDot="bg-[#0052FF]"
        />
      </div>

      {empty && (
        <div className="mt-4 text-[12px] text-amber leading-[1.55]">
          Your smart account has 0 USDC. Fund it first — until then, the
          chat / engine can&apos;t move anything for you.
        </div>
      )}
    </section>
  );
}

function BalanceTile({
  chainLabel,
  usdc,
  chainDot,
}: {
  chainLabel: string;
  usdc: string | null;
  chainDot: string;
}) {
  const human = usdc !== null ? parseFloat(usdc) : NaN;
  const display = usdc === null
    ? "…"
    : Number.isFinite(human)
      ? human.toFixed(human >= 1 ? 2 : 4)
      : usdc;
  return (
    <div className="rounded-[14px] border border-line-2 bg-black/20 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={clsx("w-2 h-2 rounded-full", chainDot)} />
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          {chainLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display [font-feature-settings:'tnum'] text-[24px] font-semibold text-silver-1 leading-none">
          {display}
        </span>
        <span className="font-mono text-[12px] text-silver-4">USDC</span>
      </div>
    </div>
  );
}
