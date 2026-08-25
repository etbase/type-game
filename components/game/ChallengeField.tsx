"use client";

import { LabeledCoin } from "@/components/game/LabeledCoin";
import {
  CHALLENGE_MISS_FADE_MS,
  CHALLENGE_SHATTER_MS,
  challengeMaxAlive,
  challengeSpawnGapMs,
  makeLiveCoin,
  takeNextSpawn,
  type LiveCoin,
} from "@/lib/challenge";
import type { LevelDef, PromptItem } from "@/lib/levels";
import { isExactAnswer, normalizeAnswer } from "@/lib/typing";
import { useEffect, useRef, useState } from "react";

type ChallengeFieldProps = {
  level: LevelDef;
  prompts: PromptItem[];
  playing: boolean;
  typed: string;
  compact: boolean;
  narrow: boolean;
  onCatch: (item: PromptItem, remaining: number) => void;
  onMiss: (item: PromptItem) => void;
  onUrgent: (urgent: boolean) => void;
  onComplete: () => void;
  onConsumeTyped: () => void;
};

export function ChallengeField({
  level,
  prompts,
  playing,
  typed,
  compact,
  narrow,
  onCatch,
  onMiss,
  onUrgent,
  onComplete,
  onConsumeTyped,
}: ChallengeFieldProps) {
  const [coins, setCoins] = useState<LiveCoin[]>([]);
  const [now, setNow] = useState(0);

  const coinsRef = useRef<LiveCoin[]>([]);
  const queueRef = useRef<PromptItem[]>([...prompts]);
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const resolvedRef = useRef(0);
  const completedRef = useRef(false);
  const urgentRef = useRef(false);
  const typedRef = useRef(typed);
  const callbacksRef = useRef({ onCatch, onMiss, onUrgent, onComplete, onConsumeTyped });

  typedRef.current = typed;
  callbacksRef.current = { onCatch, onMiss, onUrgent, onComplete, onConsumeTyped };

  useEffect(() => {
    coinsRef.current = [];
    queueRef.current = [...prompts];
    nextIdRef.current = 1;
    lastSpawnRef.current = 0;
    resolvedRef.current = 0;
    completedRef.current = false;
    urgentRef.current = false;
    setCoins([]);
  }, [prompts]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    let frame = 0;
    let lastPaint = 0;

    const loop = (time: number) => {
      let next = coinsRef.current;
      const total = prompts.length;
      const resolvedRatio = total > 0 ? resolvedRef.current / total : 0;
      const maxAlive = challengeMaxAlive(narrow, resolvedRatio);
      const gap = challengeSpawnGapMs(resolvedRatio);
      const falling = next.filter((coin) => coin.status === "falling");

      if (
        queueRef.current.length > 0 &&
        falling.length < maxAlive &&
        (lastSpawnRef.current === 0 || time - lastSpawnRef.current >= gap)
      ) {
        const taken = takeNextSpawn(queueRef.current, falling);
        if (taken) {
          queueRef.current = taken.rest;
          next = [
            ...next,
            makeLiveCoin({
              id: nextIdRef.current,
              prompt: taken.next,
              level,
              live: falling,
              narrow,
              now: time,
            }),
          ];
          nextIdRef.current += 1;
          lastSpawnRef.current = time;
        }
      }

      const typedValue = typedRef.current;
      if (typedValue.trim()) {
        const hit = next.find(
          (coin) => coin.status === "falling" && isExactAnswer(typedValue, coin.prompt.word)
        );
        if (hit) {
          const remaining = Math.max(0, 1 - (time - hit.born) / hit.duration);
          next = next.map((coin) =>
            coin.id === hit.id ? { ...coin, status: "shattered" as const, resolvedAt: time } : coin
          );
          resolvedRef.current += 1;
          callbacksRef.current.onConsumeTyped();
          callbacksRef.current.onCatch(hit.prompt, remaining);
        }
      }

      let urgent = false;
      const kept: LiveCoin[] = [];
      for (const coin of next) {
        if (coin.status === "falling") {
          const progress = (time - coin.born) / coin.duration;
          if (progress >= 0.72) {
            urgent = true;
          }
          if (progress >= 1) {
            resolvedRef.current += 1;
            callbacksRef.current.onMiss(coin.prompt);
            kept.push({ ...coin, status: "missed", resolvedAt: time });
            continue;
          }
          kept.push(coin);
          continue;
        }
        const linger = coin.status === "shattered" ? CHALLENGE_SHATTER_MS : CHALLENGE_MISS_FADE_MS;
        if (time - coin.resolvedAt < linger) {
          kept.push(coin);
        }
      }
      coinsRef.current = kept;

      if (urgent !== urgentRef.current) {
        urgentRef.current = urgent;
        callbacksRef.current.onUrgent(urgent);
      }

      if (time - lastPaint >= 32) {
        lastPaint = time;
        setNow(time);
        setCoins(kept);
      }

      if (
        !completedRef.current &&
        queueRef.current.length === 0 &&
        kept.every((coin) => coin.status !== "falling") &&
        resolvedRef.current >= total
      ) {
        completedRef.current = true;
        callbacksRef.current.onComplete();
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, level, prompts, narrow]);

  const hint = normalizeAnswer(typed);

  return (
    <div className="absolute inset-0 z-20">
      {coins.map((coin) => {
        const progress =
          coin.status === "falling" ? Math.min(1, (now - coin.born) / coin.duration) : 1;
        return (
          <LabeledCoin
            key={coin.id}
            word={coin.prompt.word}
            x={coin.x}
            progress={progress}
            status={coin.status}
            compact={compact}
            hinted={
              coin.status === "falling" &&
              hint.length > 0 &&
              normalizeAnswer(coin.prompt.word).startsWith(hint)
            }
          />
        );
      })}
    </div>
  );
}
