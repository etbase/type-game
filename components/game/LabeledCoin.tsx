"use client";

import { asset, COIN_FRONT } from "@/lib/asset";
import { CHALLENGE_SHATTER_MS } from "@/lib/challenge";
import { cn } from "@/lib/utils";

const SHARDS = [
  { tx: "-1.6rem", ty: "-1.9rem", tr: "-28deg", clip: "polygon(0 0, 55% 0, 40% 60%, 0 70%)" },
  { tx: "1.8rem", ty: "-1.4rem", tr: "34deg", clip: "polygon(45% 0, 100% 0, 100% 58%, 52% 48%)" },
  { tx: "-1.9rem", ty: "1.3rem", tr: "-46deg", clip: "polygon(0 45%, 48% 42%, 38% 100%, 0 100%)" },
  { tx: "1.7rem", ty: "1.6rem", tr: "50deg", clip: "polygon(50% 40%, 100% 38%, 100% 100%, 42% 100%)" },
  { tx: "0.15rem", ty: "2.1rem", tr: "12deg", clip: "polygon(28% 48%, 72% 48%, 68% 100%, 32% 100%)" },
];

type LabeledCoinProps = {
  word: string;
  x: number;
  progress: number;
  status: "falling" | "shattered" | "missed";
  compact?: boolean;
  split?: boolean;
  hinted?: boolean;
};

export function LabeledCoin({
  word,
  x,
  progress,
  status,
  compact = false,
  split = false,
  hinted = false,
}: LabeledCoinProps) {
  const long = word.length > 10;
  const src = asset(COIN_FRONT);

  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2"
      style={{
        left: `${x}%`,
        top: `${10 + Math.min(1, progress) * 80}%`,
        transform: "translate(-50%, -50%)",
        opacity: status === "missed" ? 0.28 : 1,
      }}
    >
      {status === "shattered" ? (
        <div className="relative labeled-coin-stack">
          {SHARDS.map((shard, index) => (
            <div
              key={index}
              className="coin-shard absolute inset-0"
              style={{
                clipPath: shard.clip,
                animationDuration: `${CHALLENGE_SHATTER_MS}ms`,
                ["--tx" as string]: shard.tx,
                ["--ty" as string]: shard.ty,
                ["--tr" as string]: shard.tr,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn("relative flex flex-col items-center", hinted && "labeled-coin-hint")}>
          <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(255,214,120,0.42),transparent_68%)] blur-md" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            width={84}
            height={84}
            className="labeled-coin-stack relative select-none drop-shadow-[0_12px_16px_rgba(0,0,0,0.5)]"
            draggable={false}
          />
          <div
            className={cn(
              "relative z-10 mt-0.5 overflow-hidden rounded-full border border-[#ead08a]/45 bg-[rgba(18,14,8,0.9)] text-center shadow-[0_6px_14px_rgba(0,0,0,0.35)]",
              split ? "max-w-[4.6rem] px-1 py-0.5" : "max-w-[min(78vw,16.5rem)] px-2.5 py-0.5",
              long && "rounded-2xl px-2 py-1"
            )}
          >
            <p
              data-coin-word={word}
              className={cn(
                "font-mono leading-tight font-semibold tracking-wide text-[#ffe9a8]",
                long || split ? "break-words" : "whitespace-nowrap",
                split ? "text-[9px] leading-tight" : compact || long ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
              )}
            >
              {word}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
