"use client";

import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { MaskIcon } from "@/components/visuals/MaskIcon";
import { useUIStore } from "@/store/ui";

/**
 * Header-centered segmented control to switch between the AI chat mode
 * (/chat) and the click-flow wizard (/create/*). Active section is
 * derived from the current pathname so the toggle reflects truth even
 * when the user lands via a deep link.
 *
 * Clicking Chat while already on /chat dispatches a "new chat" signal
 * via the UI store — the chat page subscribes and clears messages +
 * server history. Matches the gotchipus + ChatGPT mental model.
 */
export function ModeToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const requestNewChat = useUIStore((s) => s.requestNewChat);
  const isChat = pathname?.startsWith("/chat") ?? false;
  const isCustom = pathname?.startsWith("/create") ?? false;
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;
  const isActivity = pathname?.startsWith("/activity") ?? false;

  return (
    <div
      role="tablist"
      aria-label="Compass mode"
      className="inline-flex items-center p-[3px] rounded-pill bg-white/[0.04] border border-line-2"
    >
      <Pill
        active={isChat}
        label="Chat"
        onClick={() => {
          if (isChat) requestNewChat();
          else router.push("/chat");
        }}
        icon={<MaskIcon src="/icons/chat.svg" className="w-[14px] h-[14px]" />}
      />
      <Pill
        active={isCustom}
        label="Custom"
        onClick={() => router.push("/create/strategy")}
        icon={
          <MaskIcon src="/icons/strategy.svg" className="w-[14px] h-[14px]" />
        }
      />
      <Pill
        active={isDashboard}
        label="Dashboard"
        onClick={() => router.push("/dashboard")}
        icon={
          <MaskIcon
            src="/icons/dashboard.svg"
            className="w-[14px] h-[14px]"
          />
        }
      />
      <Pill
        active={isActivity}
        label="Activity"
        onClick={() => router.push("/activity")}
        icon={
          <MaskIcon src="/icons/activity.svg" className="w-[14px] h-[14px]" />
        }
      />
    </div>
  );
}

function Pill({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-[6px] rounded-pill text-[12.5px] font-medium transition-colors",
        active
          ? "bg-silver-2 text-arc-deep"
          : "text-silver-3 hover:text-silver-1",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
