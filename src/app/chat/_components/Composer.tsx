"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

export function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (s: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 rounded-[18px] border border-line-2 bg-white/[0.04] backdrop-blur-xl">
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Tell Compass what you want?"
        className="flex-1 resize-none bg-transparent outline-none text-[14px] text-silver-1 placeholder:text-silver-4 leading-[1.55] py-2 px-1 max-h-[200px]"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className={clsx(
          "px-4 py-2 rounded-pill text-[13px] font-medium transition-all",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "bg-silver-2 text-arc-deep hover:bg-silver-1 active:scale-[0.98]",
        )}
      >
        Send →
      </button>
    </div>
  );
}
