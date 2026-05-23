"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useCompassStore } from "@/store/compass";
import { nextStep, stepHref, type StepKey } from "@/lib/path";

interface Props {
  from: StepKey;
  label?: ReactNode;
  disabled?: boolean;
  override?: string;
  enterShortcut?: boolean;
  icon?: ReactNode;
}

const baseBtn =
  "group inline-flex items-center gap-[9px] px-6 py-[13px] rounded-pill " +
  "no-underline whitespace-nowrap font-semibold text-[14px] tracking-[-0.005em] " +
  "transition-all duration-[180ms] " +
  "bg-gradient-to-b from-white to-silver-2 text-arc-deep " +
  "shadow-[0_10px_30px_-10px_rgba(226,232,240,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] " +
  "hover:-translate-y-0.5 " +
  "hover:shadow-[0_14px_36px_-10px_rgba(226,232,240,0.65),inset_0_1px_0_rgba(255,255,255,0.7)]";

const disabledBtn =
  "inline-flex items-center gap-[9px] px-6 py-[13px] rounded-pill " +
  "no-underline whitespace-nowrap font-semibold text-[14px] " +
  "bg-white/[0.06] text-silver-4 cursor-not-allowed pointer-events-none";

export function ContinueButton({
  from,
  label = "Continue",
  disabled,
  override,
  enterShortcut = true,
  icon,
}: Props) {
  const router = useRouter();
  const path = useCompassStore((s) => s.path);
  const target =
    override ??
    (() => {
      const next = nextStep(path, from);
      return next ? stepHref(next, path) : null;
    })();

  useEffect(() => {
    if (!enterShortcut || disabled || !target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      router.push(target);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterShortcut, disabled, target, router]);

  if (!target) return null;

  return (
    <a
      className={clsx(disabled ? disabledBtn : baseBtn)}
      href={target}
      aria-disabled={disabled || undefined}
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        router.push(target);
      }}
    >
      {icon}
      {label}
      <span className="inline-block transition-transform group-hover:translate-x-[3px]">
        →
      </span>
    </a>
  );
}
