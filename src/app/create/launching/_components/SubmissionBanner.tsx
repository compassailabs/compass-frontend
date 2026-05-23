import type { Submission } from "./state";

/**
 * Amber error / mint success strip shown above the launch hero while
 * the policy commit POST runs in the background.
 */
export function SubmissionBanner({ submission }: { submission: Submission }) {
  if (submission.state === "error") {
    return (
      <div className="mb-[14px] px-[18px] py-[14px] rounded-[14px] border border-amber/[0.35] bg-amber/[0.08] flex items-center gap-3 text-[13px] text-amber">
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px] fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span className="font-mono text-[12px]">
          Policy commit failed:{" "}
          <b className="font-semibold">{submission.message}</b>
        </span>
      </div>
    );
  }
  if (submission.state === "success") {
    return (
      <div className="mb-[14px] px-[18px] py-[14px] rounded-[14px] border border-mint/[0.3] bg-mint/[0.06] flex items-center gap-3 text-[13px] text-mint">
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px] fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] shrink-0"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-mono text-[12px]">
          Policy <b className="font-semibold">v{submission.version}</b>{" "}
          committed · the engine will start ticking on its next cycle.
        </span>
      </div>
    );
  }
  return null;
}
