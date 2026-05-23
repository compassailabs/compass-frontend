/**
 * Shared visual tokens for review page sections — keeps every panel
 * styled consistently without copy-pasting Tailwind chains across
 * component files.
 */
export const sectionBase =
  "relative flex flex-col gap-[14px] pl-[22px] pr-[22px] pt-5 pb-5 " +
  "rounded-[18px] border backdrop-blur-xl";

export const sectionNeutral =
  "border-line-2 bg-gradient-to-b from-white/[0.035] to-white/[0.01]";

export const sectionMint =
  "border-mint/[0.25] bg-gradient-to-b from-mint/[0.06] to-mint/[0.015]";

export const VENUE_DOT: Record<string, string> = {
  "arc:idle": "bg-silver-1",
  "arbitrum_sepolia:idle": "bg-silver-2",
  "arbitrum_sepolia:aave_v3": "bg-mint",
};

export const VENUE_GRAD: Record<string, string> = {
  "arc:idle": "from-silver-1 to-silver-2",
  "arbitrum_sepolia:idle": "from-silver-2 to-silver-3",
  "arbitrum_sepolia:aave_v3": "from-mint to-[#5EBA94]",
};
