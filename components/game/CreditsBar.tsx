"use client";

import { asset, COIN_FRONT } from "@/lib/asset";
import { cn } from "@/lib/utils";

type CreditsBarProps = {
  credits: number;
  combo: number;
  flash?: "up" | "zero" | null;
};

export function CreditsBar({ credits, combo, flash }: CreditsBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-[rgba(232,196,110,0.28)] bg-[linear-gradient(180deg,rgba(36,28,14,0.92),rgba(14,12,10,0.94))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,236,180,0.12)]",
        flash === "up" && "credits-up",
        flash === "zero" && "credits-zero"
      )}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(COIN_FRONT)}
          alt=""
          className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(232,196,110,0.45)]"
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
