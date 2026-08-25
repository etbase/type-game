"use client";

import { CreditsBar } from "@/components/game/CreditsBar";
import { FallingCoin } from "@/components/game/FallingCoin";
import { Lobby } from "@/components/game/Lobby";
import { PromptCard } from "@/components/game/PromptCard";
import { ResultScreen } from "@/components/game/ResultScreen";
import { SiteFrame } from "@/components/game/SiteFrame";
import { Button } from "@/components/ui/button";
import {
  dealPrompts,
  fallDurationMs,
  getLevel,
  type LevelDef,
  type LevelId,
} from "@/lib/levels";
import {
  clearRun,
  loadSave,
  markRun,
  takeAbandonedRun,
  writeSave,
  type SaveData,
} from "@/lib/storage";
import { matchTyped, scoreCatch } from "@/lib/typing";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Screen = "lobby" | "countdown" | "playing" | "complete";
type QuestionStatus = "playing" | "caught" | "missed";

type RunState = {
  level: LevelDef;
  prompts: string[];
  index: number;
  credits: number;
  combo: number;
  bestCombo: number;
  caught: number;
  missed: number;
  status: QuestionStatus;
  progress: number;
  elapsedMs: number;
  typed: string;
  clean: boolean;
  lastGain: number;
};

const COUNTDOWN_SECONDS = 3;
const RESOLVE_MS = 620;

export function TypingGame() {
  const [save, setSave] = useState<SaveData>({
    levelScores: { 1: 0, 2: 0, 3: 0, 4: 0 },
    cleared: { 1: false, 2: false, 3: false, 4: false },
  });
  const [screen, setScreen] = useState<Screen>("lobby");
  const [abandonedLevel, setAbandonedLevel] = useState<LevelId | null>(null);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [run, setRun] = useState<RunState | null>(null);
  const [flash, setFlash] = useState<"up" | "zero" | null>(null);
  const [shake, setShake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef(0);
  const startedAtRef = useRef(0);
  const statusRef = useRef<QuestionStatus>("playing");
  const runRef = useRef<RunState | null>(null);
  const progressRef = useRef(0);
  const resolvingRef = useRef(false);

  useEffect(() => {
    const loaded = loadSave();
    const leftover = takeAbandonedRun();
    if (leftover) {
      loaded.levelScores[leftover] = 0;
      writeSave(loaded);
      setAbandonedLevel(leftover);
    }
    setSave(loaded);
  }, []);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const persist = useCallback((next: SaveData) => {
    setSave(next);
    writeSave(next);
  }, []);

  const beginLevel = useCallback((levelId: LevelId) => {
    const level = getLevel(levelId);
    const prompts = dealPrompts(level);
    const nextRun: RunState = {
      level,
      prompts,
      index: 0,
      credits: 0,
      combo: 0,
      bestCombo: 0,
      caught: 0,
      missed: 0,
      status: "playing",
      progress: 0,
      elapsedMs: 0,
      typed: "",
      clean: true,
      lastGain: 0,
    };
    durationRef.current = fallDurationMs(prompts[0], level);
    startedAtRef.current = 0;
    progressRef.current = 0;
    statusRef.current = "playing";
    resolvingRef.current = false;
    setRun(nextRun);
    setCount(COUNTDOWN_SECONDS);
    setScreen("countdown");
    setAbandonedLevel(null);
    markRun(levelId);
  }, []);

  const abandonLevel = useCallback(() => {
    const current = runRef.current;
    if (!current) {
      return;
    }
    const latest = loadSave();
    latest.levelScores[current.level.id] = 0;
    persist(latest);
    clearRun();
    setFlash("zero");
    setRun(null);
    setScreen("lobby");
    setAbandonedLevel(current.level.id);
  }, [persist]);

  useEffect(() => {
    if (screen !== "countdown") {
      return;
    }
    if (count < 0) {
      startedAtRef.current = performance.now();
      setScreen("playing");
      return;
    }
    const timer = window.setTimeout(
      () => setCount((value) => value - 1),
      count === 0 ? 420 : 700
    );
    return () => window.clearTimeout(timer);
  }, [screen, count]);

  const finishQuestion = useCallback(
    (kind: "caught" | "missed") => {
      const current = runRef.current;
      if (!current || resolvingRef.current) {
        return;
      }
      resolvingRef.current = true;
      statusRef.current = kind;

      let credits = current.credits;
      let combo = current.combo;
      let bestCombo = current.bestCombo;
      let caught = current.caught;
      let missed = current.missed;
      let lastGain = 0;

      if (kind === "caught") {
        combo += 1;
        bestCombo = Math.max(bestCombo, combo);
        caught += 1;
        const remaining = Math.max(0, 1 - progressRef.current);
        lastGain = scoreCatch({
          levelId: current.level.id,
          remaining,
          combo,
          clean: current.clean,
        });
        credits += lastGain;
        setFlash("up");
      } else {
        combo = 0;
        missed += 1;
        setShake(true);
        window.setTimeout(() => setShake(false), 420);
      }

      const nextRun: RunState = {
        ...current,
        credits,
        combo,
        bestCombo,
        caught,
        missed,
        status: kind,
        lastGain,
      };
      runRef.current = nextRun;
      setRun(nextRun);

      window.setTimeout(() => {
        const latest = runRef.current;
        if (!latest) {
          return;
        }
        const nextIndex = latest.index + 1;
        if (nextIndex >= latest.prompts.length) {
          const stored = loadSave();
          stored.levelScores[latest.level.id] = latest.credits;
          stored.cleared[latest.level.id] = true;
          persist(stored);
          clearRun();
          setScreen("complete");
          resolvingRef.current = false;
          return;
        }
        const nextPrompt = latest.prompts[nextIndex];
        durationRef.current = fallDurationMs(nextPrompt, latest.level);
        startedAtRef.current = performance.now();
        progressRef.current = 0;
        statusRef.current = "playing";
        resolvingRef.current = false;
        setRun({
          ...latest,
          index: nextIndex,
          status: "playing",
          progress: 0,
          elapsedMs: 0,
          typed: "",
          clean: true,
          lastGain: 0,
        });
        runRef.current = {
          ...latest,
          index: nextIndex,
          status: "playing",
          progress: 0,
          elapsedMs: 0,
          typed: "",
          clean: true,
          lastGain: 0,
        };
      }, RESOLVE_MS);
    },
    [persist]
  );

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }
    let frame = 0;
    const tick = (now: number) => {
      if (statusRef.current !== "playing" || resolvingRef.current) {
        return;
      }
      if (!startedAtRef.current) {
        startedAtRef.current = now;
      }
      const elapsed = Math.max(0, now - startedAtRef.current);
      const duration = durationRef.current > 0 ? durationRef.current : 6000;
      const progress = Math.min(1, elapsed / duration);
      progressRef.current = progress;
      setRun((prev) =>
        prev
          ? {
              ...prev,
              progress,
              elapsedMs: elapsed,
            }
          : prev
      );
      if (progress >= 1) {
        finishQuestion("missed");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [screen, run?.index, finishQuestion]);

  useEffect(() => {
    if (screen !== "playing" && screen !== "countdown") {
      return;
    }
    const onLeave = () => {
      const current = runRef.current;
      if (!current) {
        return;
      }
      const stored = loadSave();
      stored.levelScores[current.level.id] = 0;
      writeSave(stored);
      markRun(current.level.id);
    };
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [screen]);

  useEffect(() => {
    if (screen === "playing" && run?.status === "playing") {
      inputRef.current?.focus();
    }
  }, [screen, run?.status, run?.index]);

  useEffect(() => {
    if (!flash) {
      return;
    }
    const timer = window.setTimeout(() => setFlash(null), 480);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const prompt = run?.prompts[run.index] ?? "";
  const match = useMemo(() => matchTyped(run?.typed ?? "", prompt), [run?.typed, prompt]);

  const onTyped = (value: string) => {
    if (!run || screen !== "playing" || run.status !== "playing") {
      return;
    }
    const nextMatch = matchTyped(value, prompt);
    const clean = run.clean && !nextMatch.hasError;
    setRun({ ...run, typed: value, clean });
    if (nextMatch.done) {
      finishQuestion("caught");
    }
  };

  if (screen === "lobby") {
    return <Lobby save={save} abandonedLevel={abandonedLevel} onStart={beginLevel} />;
  }

  if (screen === "complete" && run) {
    return (
      <ResultScreen
        level={run.level}
        credits={run.credits}
        caught={run.caught}
        missed={run.missed}
        bestCombo={run.bestCombo}
        onLobby={() => {
          setRun(null);
          setScreen("lobby");
        }}
        onReplay={() => beginLevel(run.level.id)}
      />
    );
  }

  if (!run) {
    return null;
  }

  const questionNo = Math.min(run.index + 1, run.prompts.length);
  const questionTotal = run.prompts.length;
  const progressPct = ((run.index + (run.status === "playing" ? 0 : 1)) / questionTotal) * 100;
  const urgent = screen === "playing" && run.status === "playing" && run.progress >= 0.72;

  return (
    <SiteFrame>
      <div
        className={cn(
          "mx-auto flex min-h-[100vh] min-h-[100dvh] w-full max-w-3xl flex-col px-4 py-4 sm:py-6",
          shake && "screen-shake"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.32em] text-[#d7b56a] uppercase">
              Level {run.level.id} · {run.level.englishName}
            </p>
            <h1 className="font-display text-xl text-[#f7e7c2] sm:text-2xl">
              {run.level.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-sm text-[#d8c7a0] tabular-nums">
              第 {questionNo} / {questionTotal} 題
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[#e7b0a4] hover:bg-rose-950/40 hover:text-rose-100"
              onClick={abandonLevel}
            >
              放棄本關
            </Button>
          </div>
        </div>

        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#c4922e,#ffe9a8)] transition-[width] duration-300"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.6rem] border border-[rgba(232,196,110,0.22)] bg-[linear-gradient(180deg,rgba(18,22,36,0.94),rgba(8,10,16,0.98))] shadow-[inset_0_0_80px_rgba(232,196,110,0.06)]">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,214,120,0.14),transparent)]" />
          <div className="pointer-events-none lane-glow absolute inset-y-0 left-1/2 w-28 -translate-x-1/2 sm:w-36" />

          <div className="relative h-full min-h-[22rem] sm:min-h-[30rem]">
            <div className="absolute inset-x-0 top-0 bottom-[4.75rem]">
              {screen === "playing" ? (
                <FallingCoin
                  progress={run.progress}
                  spinning={run.status === "playing"}
                  caught={run.status === "caught"}
                  missed={run.status === "missed"}
                  elapsedMs={run.elapsedMs}
                />
              ) : null}

              <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
                {screen === "countdown" ? (
                  <div className="text-center">
                    <p className="text-[11px] tracking-[0.4em] text-[#d7b56a] uppercase">
                      即將開始 · 無法暫停
                    </p>
                    <p className="font-display mt-2 text-7xl text-[#ffe9a8]">
                      {count > 0 ? count : "GO"}
                    </p>
                    <p className="mt-3 text-sm text-[#cbb892]">倒數結束後，直接打出中央的英文</p>
                  </div>
                ) : (
                  <PromptCard prompt={prompt} typed={run.typed} status={run.status} />
                )}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-[4.75rem] z-40">
              <div className="relative mx-6">
                <div
                  className={cn(
                    "h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,#f0d48a,transparent)] shadow-[0_0_16px_rgba(240,212,138,0.55)]",
                    urgent && "finish-urgent bg-[linear-gradient(90deg,transparent,#ff8a6a,transparent)]"
                  )}
                />
                <div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ead08a]/50 bg-[#1a140c] px-3 py-0.5 text-[10px] tracking-[0.32em] text-[#ffe9a8] uppercase",
                    urgent && "border-rose-300/60 text-rose-100"
                  )}
                >
                  終點線
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <input
            ref={inputRef}
            value={run.typed}
            type="text"
            inputMode="text"
            lang="en"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={screen !== "playing" || run.status !== "playing"}
            onChange={(event) => onTyped(event.target.value)}
            onPaste={(event) => event.preventDefault()}
            placeholder={screen === "playing" ? "在終點線前打完英文…" : "倒數結束後開始輸入"}
            aria-label="英文輸入"
            className={cn(
              "h-14 w-full rounded-2xl border border-[rgba(232,196,110,0.35)] bg-black/40 px-4 font-mono text-lg text-[#f7e7c2] outline-none transition-colors placeholder:text-[#8b7a5c] focus-visible:border-[#ead08a] focus-visible:ring-2 focus-visible:ring-[#ead08a]/30 disabled:opacity-60",
              match.hasError && "border-rose-400/60"
            )}
          />
          <CreditsBar
            credits={run.credits}
            combo={run.combo}
            flash={flash}
            lastGain={run.lastGain}
          />
          <p className="text-center text-[11px] tracking-wide text-[#9e8d6c]">
            放棄本關會立刻把這一關的分數歸零，且遊戲開始後沒有暫停。
          </p>
        </div>
      </div>
    </SiteFrame>
  );
}
