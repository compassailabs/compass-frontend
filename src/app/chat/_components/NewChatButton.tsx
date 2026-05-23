"use client";

import clsx from "clsx";

/**
 * "+ New chat" pill shown at the top-right of the conversation layout.
 * Clears server-side history (via `clearChatHistory`) and resets the
 * UI to the hero state. `busy=true` disables it while the clear is
 * in flight.
 */
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
      <svg
        viewBox="0 0 24 24"
        className="w-[12px] h-[12px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      {busy ? "Clearing…" : "New chat"}
    </button>
  );
}
