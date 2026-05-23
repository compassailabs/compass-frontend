import Link from "next/link";

export function EmptyShell({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string } | null;
}) {
  return (
    <div className="h-full grid place-items-center px-6 py-10">
      <div className="text-center max-w-[460px] flex flex-col gap-4 items-center">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-line-2 grid place-items-center text-silver-3">
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h2 className="m-0 font-display text-[20px] font-semibold tracking-[-0.018em] text-silver-1">
          {title}
        </h2>
        <p className="m-0 text-[13.5px] text-silver-3 leading-[1.55]">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-pill bg-silver-2 text-arc-deep text-[13px] font-medium hover:bg-silver-1 transition-colors no-underline"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
