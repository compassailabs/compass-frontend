import { ReactNode } from "react";
import { StarMark } from "@/components/visuals/StarMark";

interface Props {
  agentTag: string;
  title: ReactNode;
  subtitle?: ReactNode;
  cta?: ReactNode;
}

export function StepHead({ agentTag, title, subtitle, cta }: Props) {
  return (
    <header className="flex justify-between items-end gap-6 flex-wrap mb-7">
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-[9px] mb-[14px] pl-[6px] pr-3 py-[5px] rounded-pill bg-white/[0.04] border border-line-2 font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-silver-3">
          <span className="w-[18px] h-[18px] rounded-full grid place-items-center bg-gradient-to-br from-silver-1 via-silver-3 to-silver-4">
            <StarMark className="w-[10px] h-[10px]" />
          </span>
          {agentTag}
        </div>
        <h1 className="m-0 mb-3 font-display font-semibold text-silver-1 leading-[1.05] tracking-[-0.035em] text-balance text-[clamp(30px,3.6vw,42px)] [&_em]:not-italic [&_em]:bg-gradient-to-b [&_em]:from-silver-2 [&_em]:to-silver-4 [&_em]:bg-clip-text [&_em]:text-transparent">
          {title}
        </h1>
        {subtitle ? (
          <p className="m-0 text-[14.5px] text-silver-3 leading-[1.55]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {cta ? <div className="shrink-0">{cta}</div> : null}
    </header>
  );
}
