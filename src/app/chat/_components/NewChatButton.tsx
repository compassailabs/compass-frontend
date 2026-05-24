"use client";

import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";

export function NewChatButton({
  onClick,
  busy,
}: {
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-[6px] rounded-pill border text-[12px] transition-colors",
        "border-line-2 text-silver-3 hover:text-silver-1 hover:border-line-3",
        "disabled:opacity-40 disabled:cursor-not-allowed",
      )}
      aria-label="Start a new chat"
      title="Clear conversation and start over"
    >
      <Icon name="plus" className="w-[12px] h-[12px]" />
      {busy ? "Clearing…" : "New chat"}
    </button>
  );
}
