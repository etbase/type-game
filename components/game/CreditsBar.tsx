"use client";

import { asset, COIN_FRONT } from "@/lib/asset";
import { cn } from "@/lib/utils";

type CreditsBarProps = {
  credits: number;
  combo: number;
  flash?: "up" | "zero" | null;
  lastGain?: number;
  compact?: boolean;
};

export function CreditsBar({
  credits,
  combo,
  flash,
  lastGain = 0,
  compact = false,
}: CreditsBarProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-0.5 py-0.5",
          flash === "up" && "credits-up",
          flash === "zero" && "credits-zero"
        )}
      >
        <p className="flex items-center gap-1.5 text-[13px] leading-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(COIN_FRONT)} alt="" className="h-5 w-5 object-contain" />
          <span className="tracking-[0.18em] text-[#d7b56a] uppercase">Credits</span>
          <span className="font-mono font-semibold text-[#ffe9a8] tabular-nums">
            {credits.toLocaleString("en-US")}
          </span>
          {flash === "up" && lastGain > 0 ? (
            <span className="font-mono text-[#ffe9a8]">+{lastGain}</span>
          ) : null}
        </p>
        <p
          className={cn(
            "font-mono text-[13px] font-semibold tabular-nums",
            combo > 1 ? "text-[#ffe08a]" : "text-[#8b7a5c]"
          )}
        >
          Combo x{combo}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 rounded-2xl border border-[rgba(232,196,110,0.28)] bg-[linear-gradient(180deg,rgba(36,28,14,0.92),rgba(14,12,10,0.94))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,236,180,0.12)]",
        flash === "up" && "credits-up",
        flash === "zero" && "credits-zero"
      )}
    >
      {flash === "up" && lastGain > 0 ? (
        <span className="gain-pop pointer-events-none absolute -top-2 right-28 font-mono text-sm font-semibold text-[#ffe9a8]">
          +{lastGain}
        </span>
      ) : null}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(COIN_FRONT)}
          alt=""
          className="h-11 w-11 object-contain drop-shadow-[0_0_12px_rgba(232,196,110,0.45)]"
        />
        <div>
          <p className="text-[10px] tracking-[0.42em] text-[#d7b56a] uppercase">
            Credits
          </p>
          <p className="font-mono text-2xl leading-none font-semibold text-[#ffe9a8] tabular-nums sm:text-3xl">
            {credits.toLocaleString("en-US")}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] tracking-[0.28em] text-[#b9a078] uppercase">
          Combo
        </p>
        <p
          className={cn(
            "font-mono text-xl font-semibold tabular-nums",
            combo > 1 ? "text-[#ffe08a]" : "text-[#8b7a5c]"
          )}
        >
          x{combo}
        </p>
      </div>
    </div>
  );
}
