import clsx from "clsx";

import type { Policy } from "@/lib/api";

import { SectionHead } from "./atoms";
import { sectionBase, sectionNeutral } from "./styles";

export function GuardrailsSection({ policy }: { policy: Policy | null }) {
  return (
    <section
      className={clsx(sectionBase, sectionNeutral, "[grid-area:guardrails]")}
    >
      <SectionHead n="04" label="Guardrails" />
      {policy ? (
        <ul className="list-none p-0 m-0 flex flex-col gap-[9px]">
          {[
            <>
              Max <b>{policy.protocols.per_protocol_cap_pct}%</b> in any
              single protocol
            </>,
            <>
              Up to <b>{policy.caps.max_actions_per_day}</b> rebalances per
              day
            </>,
            <>
              Skip moves if gas &gt;{" "}
              <b>${policy.gas.max_gas_usd_per_action.toFixed(2)}</b>
            </>,
            <>
              Rebalance when APR gap ≥{" "}
              <b>{(policy.triggers.apr_delta_bps / 100).toFixed(2)} bps</b>
            </>,
            <>
              Pause-all by you, anytime, <b>1 signature</b>
            </>,
          ].map((item, i) => (
            <li
              key={i}
              className="grid grid-cols-[16px_1fr] gap-[10px] items-start text-[13px] text-silver-2 leading-[1.4] [&_b]:font-medium [&_b]:font-mono [&_b]:[font-feature-settings:'tnum'] [&_b]:text-silver-1"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[14px] h-[14px] mt-[2px] fill-none stroke-mint [stroke-width:2.2] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-[12.5px] text-amber">
          Connect a wallet to see the policy that will be committed.
        </div>
      )}
    </section>
  );
}
