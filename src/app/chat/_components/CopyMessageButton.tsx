"use client";

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

import { Icon } from "@/components/visuals/Icon";

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
      aria-label={copied ? "Copied" : "Copy reply"}
      title={copied ? "Copied" : "Copy reply"}
      className={clsx(
        "inline-flex items-center transition-colors",
        copied ? "text-mint" : "text-silver-4 hover:text-silver-1",
      )}
    >
      <Icon name={copied ? "check" : "copy"} className="w-[14px] h-[14px]" />
    </button>
  );
}
