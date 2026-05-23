"use client";

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

export function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Copy failed");
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy message"
      title={copied ? "Copied" : "Copy reply"}
      className={clsx(
        "absolute bottom-2 right-2 px-2 py-[3px] rounded-pill border text-[10.5px] font-mono transition-all",
        "border-line-2 bg-arc-deep/80 backdrop-blur-sm",
        copied
          ? "text-mint border-mint/[0.4]"
          : "text-silver-3 opacity-0 group-hover:opacity-100 hover:text-silver-1 hover:border-line-3",
      )}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
