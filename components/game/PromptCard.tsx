"use client";

import { matchTyped } from "@/lib/typing";
import { cn } from "@/lib/utils";

type PromptCardProps = {
  prompt: string;
  typed: string;
  status: "idle" | "playing" | "caught" | "missed";
  compact?: boolean;
};

export function PromptCard({ prompt, typed, status, compact = false }: PromptCardProps) {
  const match = matchTyped(typed, prompt);

  return (
    <div
      className={cn(
        "relative z-30 mx-auto w-[min(100%,42rem)] rounded-3xl border text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md",
        compact ? "px-3 py-3 sm:px-5 sm:py-4" : "px-5 py-6 sm:px-8 sm:py-8",
        status === "missed" && "border-rose-400/40 bg-rose-950/35",
        status !== "missed" && "border-[rgba(232,196,110,0.28)] bg-[rgba(12,16,28,0.82)]"
      )}
    >
      <p className="mb-2 text-[11px] tracking-[0.38em] text-[#d7b56a]/80 uppercase">
        {status === "missed" ? "Missed" : "Type this"}
      </p>
      <p
        className={cn(
          "font-mono leading-tight font-semibold tracking-wide break-words text-[#f6ead2]",
          compact
            ? "text-[clamp(1.1rem,5.2vw,1.85rem)]"
            : "text-[clamp(1.35rem,4.6vw,2.45rem)]"
        )}
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
              {char === " " ? "\u00a0" : char}
            </span>
          );
        })}
      </p>
      {status === "missed" && (
        <p className="mt-2 text-sm font-medium tracking-widest text-rose-300">
          金幣碰到終點線
        </p>
      )}
      {status === "playing" && match.hasError && (
        <p className="mt-2 text-sm text-rose-300/90">打錯了，請修正後繼續</p>
      )}
    </div>
  );
}
