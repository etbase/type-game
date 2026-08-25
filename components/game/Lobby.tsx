"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteFrame } from "@/components/game/SiteFrame";
import { asset, COIN_FRONT } from "@/lib/asset";
import { LEVELS, type LevelId } from "@/lib/levels";
import { totalCredits, type SaveData } from "@/lib/storage";
import { Keyboard, Timer, Trophy, Zap } from "lucide-react";
import { useState } from "react";

type LobbyProps = {
  save: SaveData;
  onStart: (levelId: LevelId) => void;
};

const HOW_TO = [
  {
    icon: Zap,
    title: "金幣落下",
    text: "每一題都會有一枚金幣從上方往終點線掉落，遊戲開始後不會暫停。",
  },
  {
    icon: Keyboard,
    title: "打出英文",
    text: "一般關在畫面中央輸入。挑戰關會同時落下多顆金幣，打出任一顆上面的英文就能消滅它。片語關空白鍵也要打對。",
  },
  {
    icon: Timer,
    title: "趕在終點線前",
    text: "金幣碰到金色終點線前打對，就能接住金幣並得到 Credits。連續答對可累積 Combo。",
  },
  {
    icon: Trophy,
    title: "過關與離開",
    text: "每關 20 題。完成後才會更新 Best Score。中途離開會留下練習結果，但不計入最佳成績。",
  },
];

export function Lobby({ save, onStart }: LobbyProps) {
  const total = totalCredits(save);
  const [pending, setPending] = useState<LevelId | null>(null);
  const pendingLevel = pending ? LEVELS.find((level) => level.id === pending) : null;

  return (
    <SiteFrame>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-[clamp(1rem,4vh,3rem)] sm:gap-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-[rgba(232,196,110,0.28)] bg-[linear-gradient(165deg,rgba(42,32,16,0.78),rgba(10,12,20,0.94))] px-6 py-[clamp(1.5rem,5vh,3.5rem)] text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:px-12">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,210,110,0.3),transparent_70%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(COIN_FRONT)}
            alt=""
            className="mx-auto mb-4 h-20 w-20 object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] sm:h-28 sm:w-28"
          />
          <p className="text-[11px] tracking-[0.48em] text-[#d7b56a] uppercase">
            Browser Arcade
          </p>
          <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.6rem)] leading-[1.05] font-semibold text-[#f7e7c2]">
            英文打字金幣挑戰
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#d8c7a0] sm:text-base">
            金幣從上方落下。打對英文就能接住金幣、累積 Combo 與 Credits。
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[rgba(232,196,110,0.3)] bg-black/30 px-5 py-2">
            <span className="text-[10px] tracking-[0.32em] text-[#d7b56a] uppercase">
              Total Credits
            </span>
            <span className="font-mono text-xl font-semibold text-[#ffe9a8] tabular-nums">
              {total.toLocaleString("en-US")}
            </span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {LEVELS.map((level) => {
            const score = save.levelScores[level.id];
            return (
              <Card
                key={level.id}
                className="border-[rgba(232,196,110,0.18)] bg-[rgba(16,18,28,0.78)] text-[#f4ead4] ring-0"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] tracking-[0.32em] text-[#d7b56a] uppercase">
                        Level {level.id} · {level.englishName}
                      </p>
                      <CardTitle className="font-display mt-1 text-2xl text-[#f7e7c2]">
                        {level.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-[#cbb892]">
                        {level.kind} · {level.questions} 題 · {level.pace}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[rgba(232,196,110,0.35)] text-[#e7c56a]"
                    >
                      {score.toLocaleString("en-US")} cr
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-end">
                  <Button
                    size="lg"
                    onClick={() => setPending(level.id)}
                    className="h-10 min-w-28 rounded-full border border-[#ead08a]/40 bg-[linear-gradient(180deg,#f0d48a,#c4922e)] px-5 text-[#2a1b07] hover:bg-[linear-gradient(180deg,#ffe6a8,#d7a33c)]"
                  >
                    {score > 0 ? "再打一次" : "開始本關"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-[#d7b56a] uppercase">How to play</p>
              <h2 className="font-display mt-1 text-2xl text-[#f7e7c2]">第一次來怎麼玩</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {HOW_TO.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-2xl border border-[rgba(232,196,110,0.16)] bg-[rgba(12,16,26,0.72)] px-4 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ead08a]/35 bg-[#2a1f10] font-mono text-sm text-[#ffe9a8]">
                  {index + 1}
                </div>
                <div>
                  <p className="flex items-center gap-2 font-medium text-[#f7e7c2]">
                    <step.icon className="size-4 text-[#e7c56a]" />
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#cbb892]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {pendingLevel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-[rgba(232,196,110,0.28)] bg-[#121624] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] tracking-[0.32em] text-[#d7b56a] uppercase">
              Ready · Level {pendingLevel.id}
            </p>
            <h2 className="font-display mt-1 text-2xl text-[#f7e7c2]">
              {pendingLevel.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#cbb892]">
              開始後不能暫停。中途離開會留下練習結果，但不會計入 Best Score 與 Total Credits。
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-full border-[rgba(232,196,110,0.35)] bg-transparent text-[#f7e7c2]"
                onClick={() => setPending(null)}
              >
                返回
              </Button>
              <Button
                className="h-11 flex-1 rounded-full border border-[#ead08a]/40 bg-[linear-gradient(180deg,#f0d48a,#c4922e)] text-[#2a1b07]"
                onClick={() => {
                  const id = pendingLevel.id;
                  setPending(null);
                  onStart(id);
                }}
              >
                開始
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </SiteFrame>
  );
}
