import type { ReactNode } from "react";

import { MaskIcon } from "@/components/visuals/MaskIcon";
import type { StrategyKey } from "@/store/compass";

export type StrategyDef = {
  id: StrategyKey;
  label: string;
  title: string;
  tag: string;
  tagVariant?: "rec";
  desc: ReactNode;
  features: ReactNode[];
  glyph: ReactNode;
};

export const STRATEGIES: StrategyDef[] = [
  {
    id: "conservative",
    label: "Profile 01",
    title: "Conservative",
    tag: "Lowest risk",
    desc: (
      <>
        Keep me cautious. Cap any single protocol at half of capital and only
        rebalance when a real APR gap shows up.
      </>
    ),
    features: [
      <>
        Max <b>50%</b> in any single protocol
      </>,
      <>
        Trigger at <b>≥ 20 bps</b> APR gap
      </>,
      <>
        Up to <b>3</b> rebalances per day, gas ceiling <b>$3</b>
      </>,
    ],
    glyph: <MaskIcon src="/icons/conservative.svg" className="w-5 h-5" />,
  },
  {
    id: "balanced",
    label: "Profile 02",
    title: "Balanced",
    tag: "Recommended",
    tagVariant: "rec",
    desc: (
      <>
        Default mix. Concentrate a bit harder on the best venue and react to
        smaller APR moves — still well inside conservative gas bounds.
      </>
    ),
    features: [
      <>
        Max <b>70%</b> in any single protocol
      </>,
      <>
        Trigger at <b>≥ 10 bps</b> APR gap
      </>,
      <>
        Up to <b>6</b> rebalances per day, gas ceiling <b>$5</b>
      </>,
    ],
    glyph: <MaskIcon src="/icons/balanced.svg" className="w-5 h-5" />,
  },
  {
    id: "growth",
    label: "Profile 03",
    title: "Growth",
    tag: "Most aggressive",
    desc: (
      <>
        Maximum reactivity. Lets me concentrate fully in the best venue and
        chase smaller spreads — more on-chain activity, higher gas budget.
      </>
    ),
    features: [
      <>
        Up to <b>100%</b> in any single protocol
      </>,
      <>
        Trigger at <b>≥ 5 bps</b> APR gap
      </>,
      <>
        Up to <b>12</b> rebalances per day, gas ceiling <b>$10</b>
      </>,
    ],
    glyph: <MaskIcon src="/icons/growth.svg" className="w-5 h-5" />,
  },
];
