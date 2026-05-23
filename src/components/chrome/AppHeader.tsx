"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { ModeToggle } from "@/components/chrome/ModeToggle";
import { SmartAccountPill } from "@/components/account/SmartAccountPill";
import { StarMark } from "@/components/visuals/StarMark";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

/**
 * Single app-wide top bar. Hosted in root layout so both `/chat` and
 * `/create/*` render under the same chrome — same logo, same toggle,
 * same wallet + Compass account controls.
 *
 * Right cluster, in order: SmartAccountPill (post-setup) or Setup-session
 * amber pill (pre-setup) → wallet ConnectButton. Strategy / policy panel
 * lives in the Dashboard route now, not the header.
 */
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
            // If we're already on /chat, treat the logo click as a
            // "new chat" intent instead of a no-op route push.
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
              <svg
                viewBox="0 0 24 24"
                className="w-[14px] h-[14px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="M12 8v4M12 16h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </button>
          ) : (
            <SmartAccountPill />
          )}
          <ConnectButton
            accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
