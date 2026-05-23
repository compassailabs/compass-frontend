import type { ToolTrace } from "@/lib/api";

/** One message in the chat thread — user or assistant. */
export interface Message {
  role: "user" | "assistant";
  text: string;
  thinking?: string;
  trace?: ToolTrace[];
  /** True while this assistant message is still receiving stream deltas. */
  streaming?: boolean;
}
