"use client";

import clsx from "clsx";
import type { ChangeEvent } from "react";

import { PRESETS, formatMoney, presetFor } from "./constants";

const paneBase =
  "rounded-[22px] border border-line-2 backdrop-blur-xl " +
  "bg-gradient-to-b from-white/[0.04] to-white/[0.012]";

const paneLabel =
  "flex justify-between items-center font-mono text-[10px] font-medium " +
  "tracking-[0.15em] uppercase text-silver-4";

export function AmountInputPane({
  amount,
  onAmountChange,
  setAmount,
  eoaUsdc,
  alreadyInSmartAccount,
  eoa,
  isConnected,
  submitting,
  confirming,
}: {
  amount: number;
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setAmount: (n: number) => void;
  eoaUsdc: number;
  alreadyInSmartAccount: number;
  eoa: `0x${string}` | undefined;
  isConnected: boolean;
  submitting: boolean;
  confirming: boolean;
}) {
  const activePreset = presetFor(amount, eoaUsdc);

  return (
    <section
      className={clsx(
        paneBase,
        "flex flex-col gap-[22px] pl-[30px] pr-[30px] pt-7 pb-6",
      )}
    >
      <div className={paneLabel}>
        <span>From your wallet</span>
        <span className="font-mono text-[11px] text-silver-3 tracking-[0.02em] normal-case font-normal">
          <b className="text-silver-1 font-medium">{formatMoney(eoaUsdc)}</b>{" "}
          USDC in {eoa ? `${eoa.slice(0, 6)}…${eoa.slice(-4)}` : "wallet"} · Arc
        </span>
      </div>

      <div className="flex items-baseline gap-[14px] pb-[18px] border-b border-line-1">
        <input
          type="text"
          inputMode="decimal"
          value={amount === 0 ? "" : String(amount)}
          onChange={onAmountChange}
          placeholder="0"
          disabled={submitting || confirming}
          aria-label="Deposit amount in USDC"
          className="w-full p-0 bg-transparent border-0 outline-none font-mono [font-feature-settings:'tnum'] text-silver-1 placeholder:text-silver-5 caret-silver-2 text-[clamp(44px,6vw,68px)] font-medium tracking-[-0.045em] disabled:opacity-60"
        />
        <span className="shrink-0 inline-flex items-center gap-2 pl-2 pr-[14px] py-2 rounded-pill bg-white/[0.06] border border-line-2 font-display font-semibold text-[15px] text-silver-1">
          <img
            src="/icons/usdc.svg"
            alt=""
            aria-hidden
            className="w-[22px] h-[22px]"
          />
          USDC
        </span>
      </div>

      <div className="flex gap-[6px] flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() =>
              setAmount(Math.floor((eoaUsdc * p.pct) / 100 * 100) / 100)
            }
            disabled={eoaUsdc <= 0 || submitting || confirming}
            className={clsx(
              "px-[14px] py-[7px] rounded-pill border font-mono text-[11px] font-medium tracking-[0.08em] uppercase transition-all duration-[150ms]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              activePreset === p.pct
                ? "bg-silver-1 border-silver-1 text-arc-deep"
                : "bg-white/[0.04] border-line-2 text-silver-2 hover:bg-white/[0.08] hover:border-line-3",
            )}
          >
            {p.label}
          </button>
        ))}
        {eoaUsdc <= 0 && isConnected && (
          <span className="ml-2 text-[11px] text-amber font-mono self-center">
            Wallet has 0 USDC on Arc — get some from a faucet first.
          </span>
        )}
      </div>

      <div className="pt-[18px] border-t border-line-1 flex flex-col gap-[10px]">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-mono tracking-[0.04em] uppercase text-silver-4 text-[10px]">
            Already in Compass account
          </span>
          <span className="font-mono [font-feature-settings:'tnum'] text-silver-2">
            <b className="text-silver-1 font-medium">
              {formatMoney(alreadyInSmartAccount)}
            </b>{" "}
            USDC
          </span>
        </div>
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-mono tracking-[0.04em] uppercase text-silver-4 text-[10px]">
            After this deposit
          </span>
          <span className="font-mono [font-feature-settings:'tnum'] text-mint">
            <b className="font-medium">
              {formatMoney(alreadyInSmartAccount + amount)}
            </b>{" "}
            USDC
          </span>
        </div>
      </div>
    </section>
  );
}
