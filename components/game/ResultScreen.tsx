"use client";

import { Button } from "@/components/ui/button";
import { asset, COIN_SPARKLE } from "@/lib/asset";
import type { LevelDef } from "@/lib/levels";

type ResultScreenProps = {
  level: LevelDef;
  credits: number;
  caught: number;
  missed: number;
  bestCombo: number;
  onLobby: () => void;
  onReplay: () => void;
};

export function ResultScreen({
  level,
  credits,
  caught,
  missed,
  bestCombo,
  onLobby,
  onReplay,
}: ResultScreenProps) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col items-center justify-center px-4 py-10 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(COIN_SPARKLE)}
        alt=""
        className="h-28 w-28 object-contain drop-shadow-[0_0_30px_rgba(255,210,110,0.45)]"
      />
      <p className="mt-4 text-[11px] tracking-[0.4em] text-[#d7b56a] uppercase">
        Level Complete
      </p>
      <h1 className="font-display mt-2 text-4xl text-[#f7e7c2]">
        第 {level.id} 關・{level.name}
      </h1>
      <p className="mt-2 text-sm text-[#cbb892]">本關分數已入帳</p>
      <p className="font-mono mt-6 text-6xl font-semibold text-[#ffe9a8] tabular-nums">
        {credits.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-xs tracking-[0.32em] text-[#d7b56a] uppercase">
        Credits
      </p>
      <div className="mt-8 grid w-full grid-cols-3 gap-3 text-sm">
        <Stat label="接住" value={String(caught)} />
        <Stat label="錯過" value={String(missed)} />
        <Stat label="最高連擊" value={`x${bestCombo}`} />
      </div>
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="h-11 flex-1 rounded-full border border-[#ead08a]/40 bg-[linear-gradient(180deg,#f0d48a,#c4922e)] text-[#2a1b07] hover:bg-[linear-gradient(180deg,#ffe6a8,#d7a33c)]"
          onClick={onReplay}
        >
          再打一場
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 flex-1 rounded-full border-[rgba(232,196,110,0.35)] bg-transparent text-[#f7e7c2] hover:bg-white/5"
          onClick={onLobby}
        >
          回到大廳
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(232,196,110,0.18)] bg-black/30 px-3 py-4">
      <p className="text-[10px] tracking-[0.24em] text-[#b9a078] uppercase">
        {label}
      </p>
      <p className="font-mono mt-1 text-xl text-[#f7e7c2]">{value}</p>
    </div>
  );
}
