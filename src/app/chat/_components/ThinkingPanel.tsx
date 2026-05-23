
export function ThinkingPanel({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  return (
    <div className="mb-2 rounded-[14px] border border-line-1 bg-black/20 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-line-1">
        <svg
          viewBox="0 0 24 24"
          className="w-3 h-3 fill-none stroke-steel stroke-[2] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M12 3a7 7 0 014 12.7V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.3A7 7 0 0112 3z" />
          <path d="M10 22h4" />
        </svg>
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-steel">
          {streaming ? "Reasoning…" : "Reasoning"}
        </span>
        {streaming && (
          <span className="inline-block w-[6px] h-[10px] bg-steel/80 animate-blink" />
        )}
      </div>
      <div className="px-3 py-2 font-mono text-[11.5px] leading-[1.55] text-silver-3 whitespace-pre-wrap max-h-[280px] overflow-y-auto">
        {text}
      </div>
    </div>
  );
}
