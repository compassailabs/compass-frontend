
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
