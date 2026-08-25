"use client";

import { matchTyped } from "@/lib/typing";
import { cn } from "@/lib/utils";

type PromptCardProps = {
  prompt: string;
  typed: string;
  status: "idle" | "playing" | "caught" | "missed";
  compact?: boolean;
  rail?: boolean;
};

function railPromptClass(length: number) {
  if (length > 32) {
    return "text-[0.78rem] leading-snug";
  }
  if (length > 22) {
    return "text-[0.88rem] leading-snug";
  }
  if (length > 14) {
    return "text-[1rem] leading-tight";
  }
  return "text-[1.15rem] leading-tight";
}

export function PromptCard({
  prompt,
  typed,
  status,
  compact = false,
  rail = false,
}: PromptCardProps) {
  const match = matchTyped(typed, prompt);

  return (
    <div
      className={cn(
        "relative z-30 text-center",
        rail
          ? "min-h-0 w-full flex-1 overflow-hidden rounded-2xl border border-[rgba(232,196,110,0.22)] bg-[rgba(12,16,28,0.72)] px-2 py-2"
          : cn(
              "mx-auto w-[min(100%,42rem)] rounded-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md",
              compact ? "px-3 py-3" : "px-[var(--prompt-pad-x,2rem)] py-[var(--prompt-pad-y,2rem)]"
            ),
        status === "missed" && "border-rose-400/40 bg-rose-950/35",
        status !== "missed" && !rail && "border-[rgba(232,196,110,0.28)] bg-[rgba(12,16,28,0.82)]"
      )}
    >
      <p className="mb-1.5 text-[10px] tracking-[0.38em] text-[#d7b56a]/80 uppercase">
        {status === "missed" ? "Missed" : "Type this"}
      </p>
      <p
        className={cn(
          "font-mono font-semibold tracking-wide text-[#f6ead2]",
          rail
            ? cn("prompt-rail-word max-h-full overflow-hidden", railPromptClass(prompt.length))
            : cn(
                "leading-tight break-words",
                compact
                  ? "text-[clamp(1rem,4.4vh,1.65rem)]"
                  : "text-[clamp(1.05rem,4.2vh,2.45rem)]"
              )
        )}
        data-prompt={prompt}
      >
        {prompt.split("").map((char, index) => {
          const reached = index < typed.length;
          const ok = index < match.correctLen;
          return (
            <span
              key={`${char}-${index}`}
              className={cn(
                "transition-colors",
                ok && "text-emerald-300",
                reached && !ok && "text-rose-400",
                index === match.correctLen && status === "playing" && "caret-glow"
              )}
            >
              {char === " " ? (
                <span className="inline-block min-w-[0.42em] border-b border-current/35">&nbsp;</span>
              ) : (
                char
              )}
            </span>
          );
        })}
      </p>
      {status === "missed" && (
        <p className="mt-1.5 text-[11px] font-medium tracking-widest text-rose-300">
          金幣碰到終點線
        </p>
      )}
      {status === "playing" && match.hasError && (
        <p className="mt-1.5 text-[11px] text-rose-300/90">打錯了，請修正後繼續</p>
      )}
    </div>
  );
}
