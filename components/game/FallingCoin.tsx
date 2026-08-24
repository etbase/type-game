"use client";

import { asset, COIN_FRONT, COIN_SPARKLE, COIN_SPIN_FRAMES } from "@/lib/asset";
import { cn } from "@/lib/utils";

type FallingCoinProps = {
  progress: number;
  spinning: boolean;
  caught: boolean;
  missed: boolean;
  elapsedMs: number;
};

export function FallingCoin({
  progress,
  spinning,
  caught,
  missed,
  elapsedMs,
}: FallingCoinProps) {
  const frameCount = COIN_SPIN_FRAMES.length;
  const rawIndex = Math.floor(Math.max(0, elapsedMs || 0) / 95);
  const frameIndex = ((rawIndex % frameCount) + frameCount) % frameCount;
  const src = caught
    ? asset(COIN_SPARKLE)
    : spinning
      ? asset(COIN_SPIN_FRAMES[frameIndex] ?? COIN_FRONT)
      : asset(COIN_FRONT);

  return (
    <div
      className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
      style={{
        top: `calc(${progress * 100}% - 12px)`,
        transform: `translate(-50%, -50%) ${missed ? "rotate(18deg)" : ""}`,
        opacity: missed ? 0.35 : 1,
        filter: missed ? "grayscale(0.4) brightness(0.7)" : undefined,
      }}
    >
      <div className={cn("relative", caught && "coin-burst")}>
        <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(255,214,120,0.45),transparent_68%)] blur-md" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="金幣"
          className="relative h-[92px] w-auto select-none drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)] sm:h-[110px]"
          draggable={false}
        />
      </div>
    </div>
  );
}
