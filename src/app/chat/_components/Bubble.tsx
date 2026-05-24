"use client";

import { memo } from "react";

import { MarkdownMessage } from "@/components/chat/MarkdownMessage";

import { CopyMessageButton } from "./CopyMessageButton";
import { ThinkingPanel } from "./ThinkingPanel";
import { ToolChips } from "./ToolChips";
import type { Message } from "./types";

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
  const hasTrace = (message.trace?.length ?? 0) > 0;
  const idle = message.streaming && !hasText && !hasThinking && !hasTrace;

  if (idle) {
    return (
      <div className="self-start max-w-[88%] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/logo-draw-in.svg"
          alt="Thinking"
          width={36}
          height={36}
          className="block"
        />
      </div>
    );
  }

  return (
    <div className="self-start max-w-[88%] w-full space-y-2">
      {hasThinking && (
        <ThinkingPanel
          text={message.thinking!}
          streaming={message.streaming === true && !hasText}
        />
      )}

      {hasTrace && <ToolChips trace={message.trace!} />}

      {hasText && (
        <div className="text-silver-1 leading-[1.6]">
          <MarkdownMessage>{message.text}</MarkdownMessage>
          {message.streaming && (
            <span
              className="inline-block w-[7px] h-[14px] align-[-2px] ml-0.5 bg-silver-2 animate-blink"
              aria-hidden
            />
          )}
          {!message.streaming && (
            <div className="mt-2">
              <CopyMessageButton text={message.text} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
