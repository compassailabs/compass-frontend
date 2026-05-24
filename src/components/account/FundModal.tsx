"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import { arcTestnet } from "@/lib/wagmi";
import { addressExplorerUrl, txExplorerUrl } from "@/lib/explorers";
import { recordFunded } from "@/lib/api";
import { ARC_USDC_ADDRESS, ERC20_ABI } from "@/lib/tokens";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

const FAUCET_URL = "https://faucet.circle.com/";

export function FundModal() {
  const open = useUIStore((s) => s.fundModalOpen);
  const close = useUIStore((s) => s.closeFundModal);
  const balance = useUserStateStore((s) => s.balance);
  const refresh = useUserStateStore((s) => s.refresh);

  const { address: eoa, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [pendingHash, setPendingHash] = useState<`0x${string}` | null>(null);
  const [pendingAmount6dec, setPendingAmount6dec] = useState<string | null>(
    null,
  );
  const [explorerOpen, setExplorerOpen] = useState(false);
  const explorerWrapRef = useRef<HTMLDivElement | null>(null);

  const { data: receipt, isLoading: confirming } =
    useWaitForTransactionReceipt({
      hash: pendingHash ?? undefined,
      chainId: arcTestnet.id,
    });

  useEffect(() => {
    if (!receipt || !pendingHash) return;
    if (receipt.status === "success") {
      toast.success("Transfer confirmed");
      if (eoa && pendingAmount6dec) {
        void recordFunded(eoa, {
          chain: "arc",
          kind: "deposit",
          amount_6dec: pendingAmount6dec,
          tx_hash: pendingHash,
        }).catch(() => {});
      }
      void refresh();
      const t1 = window.setTimeout(() => void refresh(), 2000);
      const t2 = window.setTimeout(() => void refresh(), 5000);
      setPendingHash(null);
      setPendingAmount6dec(null);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    toast.error("Transfer reverted on-chain.");
    setPendingHash(null);
    setPendingAmount6dec(null);
  }, [receipt, pendingHash, pendingAmount6dec, eoa, refresh]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting && !confirming) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, confirming, close]);

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

  const smartAccount = balance?.smart_account ?? null;
  const currentBalance = balance?.arc_usdc ?? "0.000000";

  if (!open) return null;

  async function copyAddress() {
    if (!smartAccount) return;
    try {
      await navigator.clipboard.writeText(smartAccount);
      toast.success("Smart account address copied");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  }

  async function onTransfer() {
    if (!isConnected || !eoa) {
      toast.error("Connect a wallet first.");
      return;
    }
    if (!smartAccount) {
      toast.error("Smart account not ready. Try again in a moment.");
      return;
    }
    let raw: bigint;
    try {
      raw = parseUnits(amount, 6);
    } catch {
      toast.error("Invalid amount.");
      return;
    }
    if (raw === 0n) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      if (currentChainId !== arcTestnet.id) {
        await switchChainAsync({ chainId: arcTestnet.id });
      }
      const hash = await writeContractAsync({
        chainId: arcTestnet.id,
        address: ARC_USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [smartAccount as `0x${string}`, raw],
      });
      const txUrl = txExplorerUrl("arc", hash);
      toast.success(`Transfer sent · ${hash.slice(0, 10)}…`, {
        action: txUrl
          ? {
              label: "View",
              onClick: () => window.open(txUrl, "_blank", "noopener"),
            }
          : undefined,
      });
      setPendingHash(hash);
      setPendingAmount6dec(raw.toString());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transfer failed.";
      toast.error(msg.length > 140 ? `${msg.slice(0, 140)}…` : msg);
    } finally {
      setSubmitting(false);
    }
  }

  const arcUrl = addressExplorerUrl("arc", smartAccount);
  const arbUrl = addressExplorerUrl("arbitrum_sepolia", smartAccount);

  return (
    <>
      <div
        onClick={() => {
          if (!submitting) close();
        }}
        aria-hidden
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label="Deposit to your Compass account"
        className={clsx(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]",
          "w-[540px] max-w-[92vw] rounded-[20px] border border-line-2",
          "bg-gradient-to-b from-[#0E1A33] to-arc-deep p-6 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
              Deposit
            </div>
            <h2 className="font-display text-[20px] font-semibold text-silver-1 m-0 leading-[1.2]">
              Send USDC to your Compass account
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!submitting) close();
            }}
            disabled={submitting}
            aria-label="Close"
            className="w-7 h-7 rounded-full border border-line-2 text-silver-3 hover:text-silver-1 hover:border-line-3 grid place-items-center disabled:opacity-40"
          >
            <Icon name="close" className="w-3.5 h-3.5" />
          </button>
        </header>

        <div className="mb-5 rounded-[14px] border border-line-2 bg-black/30 p-4">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1.5">
            Your Compass account
          </div>
          {smartAccount ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12.5px] text-silver-1 break-all flex-1">
                {smartAccount}
              </span>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 px-2.5 py-1 rounded-pill border border-line-2 text-[11px] text-silver-2 hover:text-silver-1 hover:border-line-3 transition-colors"
              >
                Copy
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
                    className="absolute right-0 top-full mt-1.5 rounded-[10px] border border-line-2 bg-[#0E1A33] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] py-1 z-10 whitespace-nowrap"
                  >
                    {arcUrl && (
                      <a
                        href={arcUrl}
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
                    {arbUrl && (
                      <a
                        href={arbUrl}
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
          ) : (
            <div className="text-[12.5px] text-silver-3">
              Setup your session first to get a smart-account address.
            </div>
          )}
        </div>

        <div className="mb-4 rounded-[14px] border border-line-2 bg-black/20 p-4">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
            Option 1 · Get test USDC from a faucet
          </div>
          <div className="text-[12.5px] text-silver-3 mb-2.5 leading-[1.5]">
            Open the Circle USDC faucet and paste your{" "}
            <span className="text-silver-1 font-medium">
              connected wallet address
            </span>{" "}
            (not the smart account — faucets often reject contracts).
          </div>
          <a
            href={FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-line-2 text-[12px] text-silver-2 hover:text-silver-1 hover:border-line-3 transition-colors"
          >
            Open Circle USDC faucet ↗
          </a>
        </div>

        <div className="mb-5 rounded-[14px] border border-line-2 bg-black/20 p-4">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
            Option 2 · Transfer USDC from your wallet
          </div>
          <div className="flex items-baseline justify-between text-[11.5px] text-silver-4 mb-2">
            <span>
              From{" "}
              <span className="font-mono text-silver-2">
                {eoa ? `${eoa.slice(0, 6)}…${eoa.slice(-4)}` : "—"}
              </span>{" "}
              on Arc Testnet
            </span>
            <span>
              Smart account currently holds{" "}
              <b className="font-mono text-silver-2">{currentBalance}</b> USDC
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center rounded-pill border border-line-2 bg-black/30 px-3 h-10">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                min="0"
                step="0.000001"
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting || confirming}
                className="flex-1 bg-transparent outline-none text-[14px] text-silver-1 font-mono placeholder:text-silver-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                placeholder="0.0"
              />
              <span className="text-[11px] text-silver-4 font-mono">USDC</span>
            </div>
            <button
              type="button"
              onClick={onTransfer}
              disabled={
                submitting || confirming || !isConnected || !smartAccount
              }
              className={clsx(
                "inline-flex items-center gap-2 px-4 h-10 rounded-pill text-[13px] font-medium",
                "transition-all duration-150",
                "bg-silver-2 text-arc-deep",
                "hover:bg-silver-1 hover:shadow-[0_6px_18px_-6px_rgba(255,255,255,0.45)]",
                "active:scale-[0.96] active:shadow-none",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100",
              )}
            >
              {(submitting || confirming) && (
                <span className="w-3 h-3 rounded-full border-[1.5px] border-arc-deep border-t-transparent animate-spin-fast" />
              )}
              {submitting ? "Sending…" : confirming ? "Confirming…" : "Send"}
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-end">
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="px-4 py-2 rounded-pill border border-line-2 text-[13px] text-silver-3 hover:text-silver-1 hover:border-line-3 disabled:opacity-40 transition-colors"
          >
            Done
          </button>
        </footer>
      </div>
    </>
  );
}
