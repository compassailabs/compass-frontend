"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";
import { arcTestnet } from "@/lib/wagmi";

export function NetworkGuard() {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;
  if (chain?.id === arcTestnet.id) return null;

  async function onSwitch() {
    try {
      await switchChain({ chainId: arcTestnet.id });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? `Switch failed: ${e.message}`
          : "Switch failed.",
      );
    }
  }

  const currentLabel = chain?.name ?? `chain id ${chain?.id ?? "unknown"}`;

  return (
    <div className="shrink-0 border-b border-amber/[0.35] bg-amber/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center justify-between gap-3 text-[12.5px]">
        <div className="flex items-center gap-2 text-amber min-w-0">
          <Icon name="alert-circle" className="w-[14px] h-[14px]" />
          <span className="truncate">
            Wrong network — you&apos;re on{" "}
            <b className="font-semibold">{currentLabel}</b>. Compass
            operates on <b className="font-semibold">Arc Testnet</b>.
          </span>
        </div>
        <button
          type="button"
          onClick={onSwitch}
          disabled={isPending}
          className={clsx(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-pill text-[12px] font-medium transition-colors shrink-0",
            "border border-amber/[0.5] text-amber hover:bg-amber/[0.12]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isPending && (
            <span className="w-3 h-3 rounded-full border-[1.5px] border-amber border-t-transparent animate-spin-fast" />
          )}
          {isPending ? "Switching…" : "Switch to Arc Testnet"}
        </button>
      </div>
    </div>
  );
}
