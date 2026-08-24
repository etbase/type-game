"use client";

import { matchTyped } from "@/lib/typing";
import { cn } from "@/lib/utils";

type PromptCardProps = {
  prompt: string;
  typed: string;
  status: "idle" | "playing" | "caught" | "missed";
};

export function PromptCard({ prompt, typed, status }: PromptCardProps) {
  const match = matchTyped(typed, prompt);

  return (
    <div
      className={cn(
        "relative z-30 mx-auto w-[min(100%,40rem)] rounded-3xl border px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-8 sm:py-8",
        status === "caught" && "border-emerald-300/50 bg-emerald-950/40",
        status === "missed" && "border-rose-400/40 bg-rose-950/35",
        status !== "caught" &&
          status !== "missed" &&
          "border-[rgba(232,196,110,0.28)] bg-[rgba(12,16,28,0.78)]"
      )}
    >
      <p className="mb-3 text-[11px] tracking-[0.38em] text-[#d7b56a]/80 uppercase">
        Type this
      </p>
      <p className="font-mono text-[clamp(1.35rem,4.6vw,2.35rem)] leading-tight font-semibold tracking-wide break-words text-[#f6ead2]">
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
      {status === "caught" && (
        <p className="mt-3 text-sm font-medium tracking-widest text-emerald-300">
          接住了
        </p>
      )}
      {status === "missed" && (
        <p className="mt-3 text-sm font-medium tracking-widest text-rose-300">
          金幣碰到終點線
        </p>
      )}
    </div>
  );
}
