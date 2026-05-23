"use client";

import { memo } from "react";

import { MarkdownMessage } from "@/components/chat/MarkdownMessage";

import { CopyMessageButton } from "./CopyMessageButton";
import { StreamingPlaceholder } from "./StreamingPlaceholder";
import { ThinkingPanel } from "./ThinkingPanel";
import { ToolChips } from "./ToolChips";
import type { Message } from "./types";

/**
 * One chat bubble — branches on user vs assistant. The assistant
 * branch wires up the reasoning panel, skill chips, markdown body, and
 * the per-message copy button.
 *
 * `React.memo` is critical for streaming perf: each rAF tick we patch
 * just the in-flight assistant message (new object reference), but the
 * surrounding `messages.slice()` produces a new array. Without memo,
 * React would re-render every history bubble + every MarkdownMessage
 * tree 60 times per second. With memo + reference-stable history
 * entries, only the streaming bubble re-parses.
 */
export const Bubble = memo(function Bubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="self-end max-w-[80%] px-4 py-3 rounded-[18px] rounded-tr-[6px] bg-silver-2 text-arc-deep">
        <div className="whitespace-pre-wrap text-[14px] leading-[1.55]">
          {message.text}
        </div>
      </div>
    );
  }
  const hasText = message.text.length > 0;
  const hasThinking = (message.thinking?.length ?? 0) > 0;
  return (
    <div className="self-start max-w-[88%] w-full">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mint mb-1">
        Compass · {message.streaming ? "thinking…" : "replies"}
      </div>

      {hasThinking && (
        <ThinkingPanel
          text={message.thinking!}
          streaming={message.streaming === true && !hasText}
        />
      )}

      {message.trace && message.trace.length > 0 && (
        <ToolChips trace={message.trace} />
      )}

      {(hasText || !hasThinking) && (
        <div className="group relative px-4 py-3 rounded-[18px] rounded-tl-[6px] border border-line-2 bg-white/[0.04]">
          {hasText ? (
            <MarkdownMessage>{message.text}</MarkdownMessage>
          ) : (
            <StreamingPlaceholder />
          )}
          {message.streaming && hasText && (
            <span
              className="inline-block w-[7px] h-[14px] align-[-2px] ml-0.5 bg-silver-2 animate-blink"
              aria-hidden
            />
          )}
          {hasText && !message.streaming && (
            <CopyMessageButton text={message.text} />
          )}
        </div>
      )}
    </div>
  );
});
