import { ReactNode } from "react";

interface Props {
  text: ReactNode;
  kbd?: string;
}

export function HintFooter({ text, kbd = "Continue" }: Props) {
  return (
    <div className="flex justify-between items-center gap-[18px] mt-8 px-[18px] py-[14px] rounded-[14px] border border-dashed border-line-2 bg-white/[0.015]">
      <div className="flex items-center gap-3 text-[13px] text-silver-3 leading-[1.45]">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 fill-none stroke-silver-4 stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 17h.01" />
        </svg>
        <span className="[&_b]:text-silver-1 [&_b]:font-medium">{text}</span>
      </div>
      <div className="inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.08em] uppercase text-silver-4">
        <kbd className="inline-block px-[7px] py-[2px] rounded-md border border-line-2 bg-white/[0.05] font-mono text-[10px] text-silver-2">
          ↵
        </kbd>
        {kbd}
      </div>
    </div>
  );
}
