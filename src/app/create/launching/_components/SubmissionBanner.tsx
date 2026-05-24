import { Icon } from "@/components/visuals/Icon";
import type { Submission } from "./state";

export function SubmissionBanner({ submission }: { submission: Submission }) {
  if (submission.state === "error") {
    return (
      <div className="mb-[14px] px-[18px] py-[14px] rounded-[14px] border border-amber/[0.35] bg-amber/[0.08] flex items-center gap-3 text-[13px] text-amber">
        <Icon name="alert-circle" className="w-[18px] h-[18px]" />
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
        <Icon name="check" className="w-[18px] h-[18px]" />
        <span className="font-mono text-[12px]">
          Policy <b className="font-semibold">v{submission.version}</b>{" "}
          committed · the engine will start ticking on its next cycle.
        </span>
      </div>
    );
  }
  return null;
}
