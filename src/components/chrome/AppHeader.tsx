"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/chrome/ModeToggle";
import { WalletButton } from "@/components/chrome/WalletButton";
import { SmartAccountPill } from "@/components/account/SmartAccountPill";
import { Icon } from "@/components/visuals/Icon";
import { StarMark } from "@/components/visuals/StarMark";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

export function AppHeader() {
  const openSessionModal = useUIStore((s) => s.openSessionModal);
  const requestNewChat = useUIStore((s) => s.requestNewChat);
  const pathname = usePathname();
  const session = useUserStateStore((s) => s.session);
  const sessionNeeded = session !== null && !session.ready;
  const isOnChat = pathname?.startsWith("/chat") ?? false;

  return (
    <header className="shrink-0 border-b border-line-1 bg-arc-deep/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-[1fr_auto_1fr] items-center h-16 gap-3">
        <Link
          href="/"
          onClick={(e) => {
            if (isOnChat) {
              e.preventDefault();
              requestNewChat();
            }
          }}
          className="flex items-center gap-3 min-w-0 no-underline hover:opacity-90 transition-opacity"
          aria-label="Compass home"
        >
          <StarMark className="w-8 h-8 shrink-0 drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)]" />
          <span className="font-display text-[15px] font-semibold text-silver-1 leading-none truncate">
            Compass{" "}
            <span className="bg-gradient-to-b from-silver-1 to-silver-3 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </Link>

        <ModeToggle />

        <div className="flex items-center justify-end gap-2 min-w-0">
          {sessionNeeded ? (
            <button
              type="button"
              onClick={openSessionModal}
              className="inline-flex items-center gap-2 px-3 py-[7px] rounded-pill border border-amber/[0.4] bg-amber/[0.08] text-[12.5px] text-amber hover:bg-amber/[0.14] transition-colors"
              aria-label="Set up session"
            >
              <i className="w-[6px] h-[6px] rounded-full bg-amber animate-amber-pulse" />
              <span className="hidden sm:inline">Setup session</span>
              <Icon name="alert-circle" className="w-[14px] h-[14px]" />
            </button>
          ) : (
            <SmartAccountPill />
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
