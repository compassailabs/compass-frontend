"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Icon } from "@/components/visuals/Icon";
import { useUserStateStore } from "@/store/userState";
import { useUIStore } from "@/store/ui";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openChainModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return (
            <div
              aria-hidden
              style={{ opacity: 0, pointerEvents: "none", userSelect: "none" }}
            />
          );
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-pill border border-mint/40 bg-mint/[0.12] text-mint text-[12.5px] font-medium hover:bg-mint/[0.20] hover:border-mint/60 transition-colors"
            >
              Connect
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="inline-flex items-center gap-2 px-3 py-[7px] rounded-pill border border-amber/[0.5] bg-amber/[0.12] text-amber text-[12.5px] hover:bg-amber/[0.20] transition-colors"
            >
              <i className="w-[6px] h-[6px] rounded-full bg-amber animate-amber-pulse" />
              Wrong network
            </button>
          );
        }

        return (
          <ConnectedDropdown
            address={account.address}
            displayName={account.displayName}
            chainName={chain.name ?? "Unknown"}
            chainId={chain.id}
            openChainModal={openChainModal}
          />
        );
      }}
    </ConnectButton.Custom>
  );
}

function ConnectedDropdown({
  address,
  displayName,
  chainName,
  chainId,
  openChainModal,
}: {
  address: string;
  displayName: string;
  chainName: string;
  chainId: number;
  openChainModal: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "";

  const balance = useUserStateStore((s) => s.balance);
  const session = useUserStateStore((s) => s.session);
  const openSessionModal = useUIStore((s) => s.openSessionModal);

  const smartAccount = balance?.smart_account ?? null;
  const totalUsdc =
    balance !== null
      ? parseFloat(balance.arc_usdc || "0") +
        parseFloat(balance.arbitrum_sepolia_usdc || "0")
      : null;

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "inline-flex items-center gap-2 px-3 py-[7px] rounded-pill border text-[12.5px] transition-colors",
          open
            ? "border-mint/50 bg-mint/[0.12] text-silver-1"
            : "border-line-2 bg-white/[0.02] text-silver-1 hover:border-mint/40 hover:bg-mint/[0.08]",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Identicon seed={address} />
        <span className="hidden sm:inline font-mono text-[12px]">
          {displayName}
        </span>
        <Icon
          name="chevron-down"
          className={clsx(
            "w-3 h-3 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[320px] rounded-2xl border border-line-2 bg-arc-deep/95 backdrop-blur-xl shadow-[0_20px_40px_-8px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-[fadeInUp_180ms_ease-out]"
        >
          <Section>
            <RowAddress
              label="Wallet"
              address={address}
              displayName={displayName}
            />
          </Section>

          {smartAccount && (
            <Section>
              <RowAddress
                label="Smart account"
                address={smartAccount}
                displayName={`${smartAccount.slice(0, 6)}…${smartAccount.slice(-4)}`}
                accent
                trailing={
                  totalUsdc !== null && (
                    <span className="font-mono text-[11.5px] text-silver-3 [font-feature-settings:'tnum']">
                      {totalUsdc.toFixed(totalUsdc >= 1 ? 2 : 4)} USDC
                    </span>
                  )
                }
              />
            </Section>
          )}

          <Section>
            <button
              type="button"
              onClick={() => {
                openChainModal();
                close();
              }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.04] transition-colors text-left"
            >
              <span className="text-[12px] text-silver-3">Network</span>
              <span className="text-[12.5px] text-silver-1 inline-flex items-center gap-1.5">
                <i className="w-[6px] h-[6px] rounded-full bg-mint animate-mint-pulse" />
                {chainName}
              </span>
            </button>
          </Section>

          <SessionSection
            session={session}
            onSetup={() => {
              openSessionModal();
              close();
            }}
          />

          {!pathname.startsWith("/activity") && (
            <Section>
              <NavLink
                href="/activity"
                onClick={close}
                label="Activity"
                icon={<Icon name="clock" className="w-[14px] h-[14px]" />}
              />
            </Section>
          )}

          <Section>
            <DropdownAction
              label="View on explorer"
              onClick={() => {
                const url = explorerUrlFor(chainId, address);
                if (url) window.open(url, "_blank", "noopener,noreferrer");
                close();
              }}
              icon={<Icon name="external-link" className="w-[14px] h-[14px]" />}
            />
            <DisconnectAction onClose={close} />
          </Section>
        </div>
      )}
    </div>
  );
}

function SessionSection({
  session,
  onSetup,
}: {
  session: import("@/lib/api").SessionStatus | null;
  onSetup: () => void;
}) {
  if (!session) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const expiresAt = Math.min(
    session.arc.session_expires_at || Infinity,
    session.arbitrum_sepolia.session_expires_at || Infinity,
  );
  const remainingSec = expiresAt - nowSec;
  const ready = session.ready;
  const expired = ready && remainingSec <= 0;

  return (
    <Section>
      <button
        type="button"
        onClick={onSetup}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/[0.04] transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <i
            className={clsx(
              "w-[6px] h-[6px] rounded-full shrink-0",
              !ready || expired
                ? "bg-amber animate-amber-pulse"
                : "bg-mint animate-mint-pulse",
            )}
          />
          <span className="text-[12px] text-silver-3">Session</span>
        </div>
        <span
          className={clsx(
            "inline-flex items-center gap-1 text-[12px] font-mono [font-feature-settings:'tnum']",
            !ready || expired ? "text-amber" : "text-silver-1",
          )}
        >
          {!ready
            ? "Not set"
            : expired
              ? "Expired"
              : `${formatRemaining(remainingSec)} left`}
          <Icon name="chevron-right" className="w-[12px] h-[12px] text-silver-4" />
        </span>
      </button>
    </Section>
  );
}

function formatRemaining(sec: number): string {
  if (sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h >= 1) return `${h}h ${m}m`;
  return `${m}m`;
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-1 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line-1">
      {children}
    </div>
  );
}

function RowAddress({
  label,
  address,
  displayName,
  accent,
  trailing,
}: {
  label: string;
  address: string;
  displayName: string;
  accent?: boolean;
  trailing?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Identicon seed={address} size={28} />
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={clsx(
            "font-mono text-[13px] truncate",
            accent ? "text-mint" : "text-silver-1",
          )}
        >
          {displayName}
        </span>
        <span className="text-[10.5px] tracking-[0.08em] uppercase text-silver-4 flex items-center gap-2">
          {label}
          {trailing && <span className="text-silver-3">·</span>}
          {trailing}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        title={copied ? "Copied" : "Copy address"}
        className={clsx(
          "shrink-0 p-1 rounded transition-colors",
          copied ? "text-mint" : "text-silver-3 hover:text-silver-1",
        )}
      >
        <Icon
          name={copied ? "check" : "copy"}
          className="w-[14px] h-[14px]"
        />
      </button>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-silver-1 hover:bg-white/[0.04] transition-colors no-underline"
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      <Icon name="chevron-right" className="w-[12px] h-[12px] text-silver-4" />
    </Link>
  );
}

function DropdownAction({
  label,
  onClick,
  icon,
  danger,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12.5px] transition-colors",
        danger
          ? "text-red-400 hover:bg-red-500/[0.08]"
          : "text-silver-1 hover:bg-white/[0.04]",
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

function DisconnectAction({ onClose }: { onClose: () => void }) {
  async function doDisconnect() {
    const { disconnect } = await import("@wagmi/core");
    const { wagmiConfig } = await import("@/lib/wagmi");
    await disconnect(wagmiConfig);
    onClose();
  }
  return (
    <DropdownAction
      label="Disconnect"
      onClick={doDisconnect}
      danger
      icon={<Icon name="disconnect" className="w-[14px] h-[14px]" />}
    />
  );
}

function Identicon({ seed, size = 22 }: { seed: string; size?: number }) {
  const hue = (parseInt(seed.slice(2, 6), 16) || 0) % 360;
  const hue2 = (hue + 75) % 360;
  return (
    <span
      aria-hidden
      className="shrink-0 rounded-full block"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue} 65% 60%) 0%, hsl(${hue2} 65% 55%) 100%)`,
      }}
    />
  );
}

function explorerUrlFor(chainId: number, address: string): string | null {
  switch (chainId) {
    case 421614:
      return `https://sepolia.arbiscan.io/address/${address}`;
    case 5042002:
      return `https://explorer.testnet.arc.network/address/${address}`;
    default:
      return null;
  }
}
