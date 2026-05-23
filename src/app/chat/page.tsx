"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { clearChatHistory, streamChat, type ToolTrace } from "@/lib/api";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";
import { FundReminder } from "@/components/account/FundReminder";

import { Bubble } from "./_components/Bubble";
import { Composer } from "./_components/Composer";
import { HeroComposer } from "./_components/HeroComposer";
import { NewChatButton } from "./_components/NewChatButton";
import type { Message } from "./_components/types";

export default function ChatPage() {
  const { address, isConnected } = useAccount();
  const refreshUserState = useUserStateStore((s) => s.refresh);
  const newChatNonce = useUIStore((s) => s.newChatNonce);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function newChat() {
    if (clearing) return;
    setClearing(true);
    try {
      if (address) {
        await clearChatHistory(address);
      }
      setMessages([]);
      setInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't clear history.");
    } finally {
      setClearing(false);
    }
  }

  // Header logo + ModeToggle Chat-tab dispatch newChatNonce++ when the
  // user is already on /chat — subscribe and reset. Skip the initial
  // mount (nonce=0) so loading the page doesn't wipe history.
  const hasNoncedRef = useRef(false);
  useEffect(() => {
    if (!hasNoncedRef.current) {
      hasNoncedRef.current = true;
      return;
    }
    void newChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newChatNonce]);

  // Don't auto-replay history on mount — page refresh always lands on
  // the hero (empty) state. Backend still persists every turn (see
  // /chat/:user/history) so a future "show prior conversation" button
  // can recover them; until then the UX matches "every refresh feels
  // like a fresh ChatGPT tab". Wallet change → drop any in-flight UI
  // messages.
  useEffect(() => {
    setMessages([]);
  }, [address]);

  // Auto-scroll the chat to the latest message. `behavior: "auto"`
  // (instant) — smooth scroll animations queue up and choke the
  // renderer at high token rates. Always glue to bottom on any
  // messages change so a new user send / streaming reply pulls the
  // viewport down without the user having to drag.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    if (!isConnected || !address) {
      toast.error("Connect a wallet to chat.");
      return;
    }
    setInput("");
    setSending(true);

    // Optimistic user bubble + empty assistant placeholder we'll grow
    // as deltas land. Tracking the placeholder's index lets us update
    // it in place without React identity gymnastics.
    let assistantIdx = -1;
    setMessages((prev) => {
      const next: Message[] = [
        ...prev,
        { role: "user", text },
        { role: "assistant", text: "", streaming: true },
      ];
      assistantIdx = next.length - 1;
      return next;
    });

    const localTrace: ToolTrace[] = [];

    // rAF-batched delta coalescer. SSE deltas can arrive 50+ times/sec
    // (one per LLM token); flushing each as its own setState makes
    // ReactMarkdown re-parse the full tree 50× per second and the UI
    // visibly stutters. Instead we accumulate text + thinking in refs
    // and flush at most once per animation frame (~16ms / 60fps), which
    // matches the eye's refresh rate and keeps markdown render cost
    // bounded regardless of token rate.
    let pendingText = "";
    let pendingThinking = "";
    let rafScheduled = false;
    function flush() {
      rafScheduled = false;
      if (!pendingText && !pendingThinking) return;
      const t = pendingText;
      const th = pendingThinking;
      pendingText = "";
      pendingThinking = "";
      setMessages((prev) => {
        const copy = prev.slice();
        const m = copy[assistantIdx];
        if (!m) return prev;
        copy[assistantIdx] = {
          ...m,
          text: m.text + t,
          thinking: th ? (m.thinking ?? "") + th : m.thinking,
        };
        return copy;
      });
    }
    function scheduleFlush() {
      if (rafScheduled) return;
      rafScheduled = true;
      // Use requestAnimationFrame when available, falls back to
      // setTimeout for non-browser test envs.
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(flush);
      } else {
        setTimeout(flush, 16);
      }
    }

    function patchAssistant(fn: (m: Message) => Message) {
      setMessages((prev) => {
        const copy = prev.slice();
        const m = copy[assistantIdx];
        if (!m) return prev;
        copy[assistantIdx] = fn(m);
        return copy;
      });
    }

    try {
      await streamChat(address, text, (ev) => {
        switch (ev.type) {
          case "text_delta":
            pendingText += ev.text;
            scheduleFlush();
            break;
          case "thinking_delta":
            pendingThinking += ev.text;
            scheduleFlush();
            break;
          case "tool_call":
            // Flush any in-flight text first so the trace row appears
            // *after* the text the model just emitted, not before.
            flush();
            localTrace.push({
              turn: localTrace.length,
              name: ev.name,
              input: ev.input,
              output: "(pending…)",
            });
            patchAssistant((m) => ({ ...m, trace: [...localTrace] }));
            break;
          case "tool_result": {
            const idx = localTrace.findIndex(
              (t) => t.name === ev.name && t.output === "(pending…)",
            );
            if (idx >= 0)
              localTrace[idx] = { ...localTrace[idx], output: ev.output };
            patchAssistant((m) => ({ ...m, trace: [...localTrace] }));
            break;
          }
          case "text_replace":
            // Server-side fabrication detector overwrote the streamed
            // text with a retraction. Cancel any pending delta + reset.
            pendingText = "";
            pendingThinking = "";
            patchAssistant((m) => ({ ...m, text: ev.text }));
            break;
          case "message_stop":
            flush();
            patchAssistant((m) => ({ ...m, streaming: false }));
            void refreshUserState();
            break;
          case "error":
            flush();
            toast.error(ev.message);
            patchAssistant((m) => ({ ...m, streaming: false }));
            break;
        }
      });
    } catch (e) {
      flush();
      const msg = e instanceof Error ? e.message : "Chat stream failed.";
      toast.error(msg);
      patchAssistant((m) => ({ ...m, streaming: false }));
    } finally {
      setSending(false);
    }
  }

  // Two layouts:
  //   * Hero (no messages yet) — composer centered, hero text above,
  //     examples below. Classic ChatGPT/Claude empty-state.
  //   * Conversation — messages scroll above a bottom-pinned composer.
  // The third UX rule ("对话框始终在输入框上面") applies inside the
  // conversation layout: messages always render above the composer.
  // No `historyLoaded` gate — we don't auto-load history, so the
  // hero state is correct from the very first render (no flicker of
  // the chat-state UI before history "loads").
  const isHero = messages.length === 0 && !sending;

  return (
    <div className="h-full flex flex-col max-w-[760px] mx-auto px-6">
      {isHero ? (
        <HeroComposer
          input={input}
          onChange={setInput}
          onSubmit={send}
          disabled={sending || !isConnected}
          onPickExample={(t) => setInput(t)}
        />
      ) : (
        <>
          <div className="pt-3 shrink-0 flex justify-end">
            <NewChatButton onClick={newChat} busy={clearing} />
          </div>
          <div
            ref={scrollRef}
            className="no-scrollbar flex-1 min-h-0 overflow-y-auto pt-2 pb-6 flex flex-col gap-4"
          >
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
          </div>
          <div className="pt-3 pb-6 shrink-0 flex flex-col gap-2">
            <FundReminder />
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={send}
              disabled={sending || !isConnected}
            />
          </div>
        </>
      )}
    </div>
  );
}
