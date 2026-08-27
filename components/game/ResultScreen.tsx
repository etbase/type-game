"use client";

import { Button } from "@/components/ui/button";
import { SiteFrame } from "@/components/game/SiteFrame";
import { asset, COIN_FRONT, COIN_SPARKLE } from "@/lib/asset";
import type { LevelDef } from "@/lib/levels";
import type { RoundEntry } from "@/lib/round-log";
import { accuracyPct } from "@/lib/stats";
import { cn } from "@/lib/utils";

type ResultScreenProps = {
  level: LevelDef;
  credits: number;
  caught: number;
  missed: number;
  bestCombo: number;
  total: number;
  bestRecord: number;
  newRecord?: boolean;
  incomplete?: boolean;
  log: RoundEntry[];
  onLobby: () => void;
  onReplay: () => void;
};

export function ResultScreen({
  level,
  credits,
  caught,
  missed,
  bestCombo,
  total,
  bestRecord,
  newRecord = false,
  incomplete = false,
  log,
  onLobby,
  onReplay,
}: ResultScreenProps) {
  const accuracy = accuracyPct(caught, missed);
  const perfect = !incomplete && missed === 0 && caught > 0 && log.length > 0;

  return (
    <SiteFrame>
      <div className="mx-auto flex min-h-[100vh] min-h-[100dvh] min-h-[100svh] w-full max-w-2xl flex-col px-4 py-[clamp(1.25rem,4vh,2.5rem)] pb-10">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(incomplete ? COIN_FRONT : COIN_SPARKLE)}
            alt=""
            className="h-[clamp(4.5rem,14vh,7rem)] w-[clamp(4.5rem,14vh,7rem)] object-contain drop-shadow-[0_0_30px_rgba(255,210,110,0.45)]"
          />
          <p className="mt-4 text-[11px] tracking-[0.4em] text-[#d7b56a] uppercase">
            {incomplete ? "Practice Result" : perfect ? "Perfect Clear" : "Level Complete"}
          </p>
          <h1 className="font-display mt-2 text-[clamp(1.6rem,5vh,2.25rem)] text-[#f7e7c2]">
            第 {level.id} 關・{level.name}
          </h1>
          {newRecord && !incomplete ? (
            <p className="new-record mt-3 inline-flex rounded-full border border-[#ead08a]/50 bg-[rgba(42,28,8,0.9)] px-3 py-1 text-[11px] tracking-[0.32em] text-[#ffe9a8] uppercase">
              New Record
            </p>
          ) : null}
          <p className="mt-2 text-sm text-[#cbb892]">
            {incomplete
              ? "未完成，不計入 Best Score 與 Total Credits"
              : perfect
                ? "全部接住了，本關分數已入帳"
                : "本關分數已入帳"}
          </p>
          <p className="font-mono mt-6 text-[clamp(2.25rem,8vh,3.75rem)] font-semibold text-[#ffe9a8] tabular-nums">
            {credits.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs tracking-[0.32em] text-[#d7b56a] uppercase">
            {incomplete ? "Practice Credits" : "Credits"}
          </p>
          <div className="mt-8 grid w-full grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Stat label="答對" value={`${caught} / ${total}`} />
            <Stat label="Accuracy" value={`${accuracy}%`} />
            <Stat label="Best Combo" value={`x${bestCombo}`} />
            <Stat label={incomplete ? "本局 Credits" : "本局獲得"} value={credits.toLocaleString("en-US")} />
            <Stat label="Highest Score" value={bestRecord.toLocaleString("en-US")} />
            <Stat label={incomplete ? "狀態" : "Score"} value={incomplete ? "Incomplete" : credits.toLocaleString("en-US")} />
          </div>
        </div>

        <section className="mt-8 w-full text-left">
          <p className="text-[11px] tracking-[0.32em] text-[#d7b56a] uppercase">
            Round Review
          </p>
          <h2 className="font-display mt-1 text-xl text-[#f7e7c2]">本局單字複習</h2>
          {log.length === 0 ? (
            <p className="mt-3 text-sm text-[#cbb892]">這一局還沒有出現過題目。</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {log.map((entry, index) => (
                <ReviewRow key={`${entry.word}-${index}`} entry={entry} />
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:gap-3">
          <Button
            size="lg"
            className="h-12 min-h-12 flex-1 rounded-full border border-[#ead08a]/40 bg-[linear-gradient(180deg,#f0d48a,#c4922e)] px-5 py-3 text-base text-[#2a1b07] hover:bg-[linear-gradient(180deg,#ffe6a8,#d7a33c)] sm:h-12"
            onClick={onReplay}
          >
            再打一場
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 min-h-12 flex-1 rounded-full border-[rgba(232,196,110,0.35)] bg-transparent px-5 py-3 text-base text-[#f7e7c2] hover:bg-white/5 sm:h-12"
            onClick={onLobby}
          >
            回到大廳
          </Button>
        </div>
      </div>
    </SiteFrame>
  );
}

function ReviewRow({ entry }: { entry: RoundEntry }) {
  return (
    <li
      data-review-word={entry.word}
      data-review-correct={entry.correct ? "true" : "false"}
      className={cn(
        "rounded-xl border px-3 py-2.5",
        entry.correct
          ? "border-[rgba(110,180,140,0.22)] bg-[rgba(12,28,20,0.42)]"
          : "border-[rgba(214,132,96,0.32)] bg-[rgba(46,20,14,0.5)]"
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p
          className={cn(
            "font-mono min-w-0 break-words font-semibold",
            entry.correct ? "text-[#d8f0dc]" : "text-[#ffc4b0]"
          )}
        >
          {entry.word}
        </p>
        <p
          className={cn(
            "min-w-0 break-words text-sm sm:text-right",
            entry.correct ? "text-[#9ec9a8]" : "text-[#e7a090]"
          )}
        >
          {entry.meaning}
        </p>
      </div>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-2xl border border-[rgba(232,196,110,0.18)] bg-black/30 px-3 py-4")}>
      <p className="text-[10px] tracking-[0.24em] text-[#b9a078] uppercase">
        {label}
      </p>
      <p className="font-mono mt-1 text-xl text-[#f7e7c2]">{value}</p>
    </div>
  );
}
