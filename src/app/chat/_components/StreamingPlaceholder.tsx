/**
 * Three pulsing dots shown inside an assistant bubble while the LLM is
 * still thinking + before any visible text has arrived. Disappears
 * once the first text_delta lands and the bubble starts populating.
 */
export function StreamingPlaceholder() {
  return (
    <div className="inline-flex items-center gap-[6px]">
      <i className="w-[6px] h-[6px] rounded-full bg-silver-3 animate-blink" />
      <i
        className="w-[6px] h-[6px] rounded-full bg-silver-3 animate-blink"
        style={{ animationDelay: "0.2s" }}
      />
      <i
        className="w-[6px] h-[6px] rounded-full bg-silver-3 animate-blink"
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  );
}
