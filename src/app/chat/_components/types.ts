import type { ToolTrace } from "@/lib/api";

export interface Message {
  role: "user" | "assistant";
  text: string;
  thinking?: string;
  trace?: ToolTrace[];
  streaming?: boolean;
}
