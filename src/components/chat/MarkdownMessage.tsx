"use client";

import { memo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import clsx from "clsx";

import "highlight.js/styles/atom-one-dark.css";

/**
 * Markdown renderer for chat bubbles. Stripped-down adaptation of the
 * gotchipus terminal markdown component:
 *   - GitHub-flavored markdown (tables, strikethrough, task lists)
 *   - rehype-highlight for fenced code blocks
 *   - PreCode wraps `<pre>` with a copy button
 *   - SmartLink opens external URLs in a new tab with `rel="noopener"`
 *
 * Skipped on purpose: math (KaTeX), mermaid diagrams, streaming-aware
 * incomplete-fence patching, soft-break plugin. Compass chat doesn't
 * stream and doesn't render math.
 */
export const MarkdownMessage = memo(function MarkdownMessage({
  children,
}: {
  children: string;
}) {
  return (
    <div className="markdown-body text-[14px] text-silver-2 leading-[1.6]">
      <ReactMarkdown
        remarkPlugins={[RemarkGfm]}
        rehypePlugins={[
          // `detect: false` is the streaming-friendly setting (matches
          // gotchi-rs): only highlight when the fence has an explicit
          // ```lang tag. Auto-detection runs a classifier on every
          // chunk and is the single biggest cost during live updates.
          [RehypeHighlight, { detect: false, ignoreMissing: true }],
        ]}
        components={{
          pre: PreCode,
          a: SmartLink,
          // Tighten Tailwind reset interactions on common elements.
          p: ({ children, ...rest }) => (
            <p {...rest} className="my-2 first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-[1.55]">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mt-3 mb-2 font-display text-[18px] font-semibold text-silver-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-3 mb-2 font-display text-[16px] font-semibold text-silver-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-3 mb-1.5 font-display text-[14.5px] font-semibold text-silver-1">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="text-silver-1 font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-silver-1 italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-line-2 pl-3 text-silver-3 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-line-1" />,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full text-[12.5px] border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-line-2 px-2 py-1 bg-white/[0.04] text-left font-mono text-[11px] tracking-wide text-silver-3 uppercase">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-line-1 px-2 py-1 text-silver-2 align-top">
              {children}
            </td>
          ),
          // Inline `code` (not the parent of <pre>) — short distinctive
          // mono treatment.
          code: ({
            className,
            children,
            ...rest
          }: React.HTMLAttributes<HTMLElement>) => {
            const isBlock = (className ?? "").startsWith("language-");
            if (isBlock) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="px-1.5 py-[1px] rounded-[5px] bg-white/[0.06] border border-line-1 font-mono text-[12.5px] text-silver-1"
                {...rest}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});

/**
 * Wraps `<pre>` blocks with a "Copy" button that copies the inner
 * `<code>` text. Same pattern as gotchipus — minus the mermaid escape
 * hatch (we don't render diagrams in chat).
 */
function PreCode({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  function copy() {
    const codeText = ref.current?.querySelector("code")?.innerText ?? "";
    if (!codeText) return;
    void navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div className="relative my-2 group">
      <pre
        ref={ref}
        className="overflow-x-auto rounded-[10px] border border-line-2 bg-black/40 p-3 font-mono text-[12.5px] leading-[1.5] text-silver-1"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className={clsx(
          "absolute top-2 right-2 px-2 py-[3px] rounded-pill border text-[10.5px] font-mono transition-all",
          "border-line-2 bg-arc-deep/80 backdrop-blur-sm",
          copied
            ? "text-mint border-mint/[0.4]"
            : "text-silver-3 opacity-0 group-hover:opacity-100 hover:text-silver-1 hover:border-line-3",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/**
 * Links open in a new tab when external; same-tab for our own routes.
 * `noopener noreferrer` keeps the new tab from getting `window.opener`.
 */
function SmartLink({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal =
    !!href && /^https?:\/\//i.test(href) && !href.includes("localhost");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text-silver-1 underline decoration-line-2 underline-offset-[3px] hover:decoration-silver-2 transition-colors"
      {...rest}
    >
      {children}
    </a>
  );
}
