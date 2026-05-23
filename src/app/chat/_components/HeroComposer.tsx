"use client";

import { StarMark } from "@/components/visuals/StarMark";
import { FundReminder } from "@/components/account/FundReminder";

import { Composer } from "./Composer";
import { HeroTagline } from "./HeroTagline";

const EXAMPLES = [
  "I have 50 USDC, help me invest conservatively.",
  "Switch me to growth — allow more rebalances.",
  "How is my position doing?",
  "Pause everything for now.",
];

/**
 * Empty-state hero — the layout the user sees on a fresh chat session.
 * Spinning star + tagline up top, composer in the middle, a few example
 * prompts at the bottom. Once any messages exist `ChatPage` swaps to
 * the conversation layout.
 */
export function HeroComposer({
  input,
  onChange,
  onSubmit,
  disabled,
  onPickExample,
}: {
  input: string;
  onChange: (s: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  onPickExample: (s: string) => void;
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-7 pb-12">
      <div className="text-center max-w-[720px]">
        <StarMark className="w-14 h-14 mx-auto mb-5 animate-spin-very-slow drop-shadow-[0_0_24px_rgba(255,255,255,0.22)]" />
        <HeroTagline />
      </div>

      <div className="w-full max-w-[640px] flex flex-col gap-3">
        <Composer
          value={input}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
        <FundReminder />
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-[600px]">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPickExample(e)}
            className="px-3 py-2 rounded-pill border border-line-2 text-[12.5px] text-silver-3 hover:text-silver-1 hover:border-line-3 hover:bg-white/[0.04] transition-colors"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
