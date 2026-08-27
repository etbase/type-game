"use client";

import { CreditsBar } from "@/components/game/CreditsBar";
import { ChallengeField } from "@/components/game/ChallengeField";
import { FallingCoin } from "@/components/game/FallingCoin";
import { Lobby } from "@/components/game/Lobby";
import { MeaningToast } from "@/components/game/MeaningToast";
import { TracePad } from "@/components/game/TracePad";
import { ResultScreen } from "@/components/game/ResultScreen";
import { SiteFrame } from "@/components/game/SiteFrame";
import { Button } from "@/components/ui/button";
import {
  dealPrompts,
  fallDurationMs,
  getLevel,
  type LevelDef,
  type LevelId,
  type PromptItem,
} from "@/lib/levels";
import {
  applyCompleteScore,
  clearIncomplete,
  clearRun,
  loadSave,
  markRun,
  snapshotFromRun,
  readIncomplete,
  writeIncomplete,
  writeSave,
  type SaveData,
} from "@/lib/storage";
import { isExactAnswer, matchTyped, scoreCatch } from "@/lib/typing";
import { logPrompt, type RoundEntry } from "@/lib/round-log";
import { cn } from "@/lib/utils";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { useCallback, useEffect, useRef, useState } from "react";

type Screen = "lobby" | "countdown" | "playing" | "complete";
type QuestionStatus = "playing" | "caught" | "missed";

type RunState = {
  level: LevelDef;
  prompts: PromptItem[];
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
  log: RoundEntry[];
};

const COUNTDOWN_SECONDS = 3;
const MISS_RESOLVE_MS = 480;
const MEANING_TOAST_MS = 1200;

export function TypingGame() {
  const [save, setSave] = useState<SaveData>({
    levelScores: { 1: 0, 2: 0, 3: 0, 4: 0 },
    cleared: { 1: false, 2: false, 3: false, 4: false },
  });
  const [screen, setScreen] = useState<Screen>("lobby");
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [run, setRun] = useState<RunState | null>(null);
  const [flash, setFlash] = useState<"up" | "zero" | null>(null);
  const [shake, setShake] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [meaningToast, setMeaningToast] = useState<{
    word: string;
    meaning: string;
    key: number;
  } | null>(null);
  const [challengeUrgent, setChallengeUrgent] = useState(false);

  const inPlay = screen === "playing" || screen === "countdown";
  const viewportFit = useVisualViewport(inPlay);
  const isPhone = viewportFit.isPhone;

  const inputRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef(0);
  const startedAtRef = useRef(0);
  const statusRef = useRef<QuestionStatus>("playing");
  const runRef = useRef<RunState | null>(null);
  const progressRef = useRef(0);
  const resolvingRef = useRef(false);
  const completeTimerRef = useRef(0);

  useEffect(() => {
    const loaded = loadSave();
    setSave(loaded);
    const leftover = readIncomplete();
    if (!leftover) {
      return;
    }
    const level = getLevel(leftover.levelId);
    setRun({
      level,
      prompts: Array.from({ length: leftover.total }, () => ({ word: "", meaning: "" })),
      index: leftover.caught + leftover.missed,
      credits: leftover.credits,
      combo: 0,
      bestCombo: leftover.bestCombo,
      caught: leftover.caught,
      missed: leftover.missed,
      status: "missed",
      progress: 1,
      elapsedMs: 0,
      typed: "",
      clean: true,
      lastGain: 0,
      log: leftover.log ?? [],
    });
    setIncomplete(true);
    setNewRecord(false);
    setScreen("complete");
  }, []);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const persist = useCallback((next: SaveData) => {
    setSave(next);
    writeSave(next);
  }, []);

  const goToNextQuestion = useCallback(
    (latest: RunState) => {
      const nextIndex = latest.index + 1;
      if (nextIndex >= latest.prompts.length) {
        window.clearTimeout(completeTimerRef.current);
        const delay = latest.status === "caught" ? MEANING_TOAST_MS : 0;
        completeTimerRef.current = window.setTimeout(() => {
          const stored = loadSave();
          const applied = applyCompleteScore(stored, latest.level.id, latest.credits);
          persist(applied.save);
          clearRun();
          clearIncomplete();
          setNewRecord(applied.newRecord);
          setIncomplete(false);
          setScreen("complete");
          resolvingRef.current = false;
        }, delay);
        return;
      }
      const nextPrompt = latest.prompts[nextIndex];
      durationRef.current = fallDurationMs(nextPrompt, latest.level);
      startedAtRef.current = performance.now();
      progressRef.current = 0;
      statusRef.current = "playing";
      resolvingRef.current = false;
      const advanced: RunState = {
        ...latest,
        index: nextIndex,
        status: "playing",
        progress: 0,
        elapsedMs: 0,
        typed: "",
        clean: true,
        lastGain: 0,
      };
      runRef.current = advanced;
      setRun(advanced);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
    },
    [persist]
  );

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
      log: [],
    };
    durationRef.current = fallDurationMs(prompts[0], level);
    startedAtRef.current = 0;
    progressRef.current = 0;
    statusRef.current = "playing";
    resolvingRef.current = false;
    clearIncomplete();
    setRun(nextRun);
    setCount(COUNTDOWN_SECONDS);
    setScreen("countdown");
    setIncomplete(false);
    setNewRecord(false);
    markRun(levelId);
    setChallengeUrgent(false);
  }, []);

  const abandonLevel = useCallback(() => {
    const current = runRef.current;
    if (!current) {
      return;
    }
    writeIncomplete(snapshotFromRun(current));
    clearRun();
    setFlash(null);
    setMeaningToast(null);
    window.clearTimeout(completeTimerRef.current);
    setIncomplete(true);
    setNewRecord(false);
    setScreen("complete");
  }, []);

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
      const item = current.prompts[current.index];
      if (!item?.word) {
        return;
      }
      const log = logPrompt(current.log ?? [], item, kind === "caught", current.level.id);

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
        setMeaningToast({
          word: item.word,
          meaning: item.meaning,
          key: Date.now(),
        });
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
        log,
      };
      runRef.current = nextRun;
      setRun(nextRun);

      if (kind === "caught") {
        goToNextQuestion(nextRun);
        return;
      }

      window.setTimeout(() => {
        const latest = runRef.current;
        if (!latest) {
          return;
        }
        goToNextQuestion(latest);
      }, MISS_RESOLVE_MS);
    },
    [goToNextQuestion]
  );

  const onChallengeCatch = useCallback((item: PromptItem, remaining: number) => {
    const current = runRef.current;
    if (!current) {
      return;
    }
    const combo = current.combo + 1;
    const lastGain = scoreCatch({
      levelId: current.level.id,
      remaining,
      combo,
      clean: true,
    });
    const next: RunState = {
      ...current,
      credits: current.credits + lastGain,
      combo,
      bestCombo: Math.max(current.bestCombo, combo),
      caught: current.caught + 1,
      typed: "",
      lastGain,
      log: logPrompt(current.log ?? [], item, true, current.level.id),
    };
    runRef.current = next;
    setRun(next);
    setFlash("up");
    window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    setMeaningToast({
      word: item.word,
      meaning: item.meaning,
      key: Date.now(),
    });
  }, []);

  const onChallengeMiss = useCallback((item: PromptItem) => {
    const current = runRef.current;
    if (!current) {
      return;
    }
    const next: RunState = {
      ...current,
      combo: 0,
      missed: current.missed + 1,
      lastGain: 0,
      log: logPrompt(current.log ?? [], item, false, current.level.id),
    };
    runRef.current = next;
    setRun(next);
    setFlash("zero");
  }, []);

  const onChallengeComboBreak = useCallback(() => {
    const current = runRef.current;
    if (!current || current.combo === 0) {
      return;
    }
    const next: RunState = { ...current, combo: 0 };
    runRef.current = next;
    setRun(next);
    setFlash("zero");
  }, []);

  const onChallengeComplete = useCallback(() => {
    const latest = runRef.current;
    if (!latest) {
      return;
    }
    window.clearTimeout(completeTimerRef.current);
    completeTimerRef.current = window.setTimeout(() => {
      const stored = loadSave();
      const applied = applyCompleteScore(stored, latest.level.id, latest.credits);
      persist(applied.save);
      clearRun();
      clearIncomplete();
      setNewRecord(applied.newRecord);
      setIncomplete(false);
      setScreen("complete");
    }, MEANING_TOAST_MS);
  }, [persist]);

  useEffect(() => {
    if (screen !== "playing" || runRef.current?.level.mode === "challenge") {
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
      setRun((prev) => {
        if (!prev) {
          return prev;
        }
        const latest = runRef.current;
        return {
          ...prev,
          typed: latest?.typed ?? prev.typed,
          combo: latest?.combo ?? prev.combo,
          clean: latest?.clean ?? prev.clean,
          progress,
          elapsedMs: elapsed,
        };
      });
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
      writeIncomplete(snapshotFromRun(current));
    };
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [screen]);

  useEffect(() => {
    if (!inPlay) {
      return;
    }
    const node = inputRef.current;
    if (!node || node.disabled) {
      return;
    }
    if (document.activeElement === node) {
      return;
    }
    node.focus({ preventScroll: true });
  }, [inPlay, screen, run?.index]);

  useEffect(() => {
    if (!flash) {
      return;
    }
    const timer = window.setTimeout(() => setFlash(null), 480);
    return () => window.clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    if (!inPlay) {
      return;
    }
    const current = runRef.current;
    if (!current || (current.caught + current.missed === 0 && current.credits === 0)) {
      return;
    }
    writeIncomplete(snapshotFromRun(current));
  }, [inPlay, run?.caught, run?.missed, run?.credits, run?.bestCombo, run?.level.id, run?.prompts.length, run?.log.length]);

  useEffect(() => {
    if (!meaningToast) {
      return;
    }
    const timer = window.setTimeout(() => setMeaningToast(null), MEANING_TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [meaningToast]);

  useEffect(() => {
    if (!isPhone || !inPlay) {
      return;
    }
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    const pin = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", pin);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
      window.removeEventListener("scroll", pin);
    };
  }, [isPhone, inPlay]);

  const prompt = run?.prompts[run.index]?.word ?? "";

  const onTyped = (value: string) => {
    if (!run || screen !== "playing" || run.status !== "playing") {
      return;
    }
    const current = runRef.current ?? run;
    if (current.level.mode === "challenge") {
      const next = { ...current, typed: value };
      runRef.current = next;
      setRun(next);
      return;
    }
    const nextMatch = matchTyped(value, prompt);
    const errored = nextMatch.hasError;
    const clean = current.clean && !errored;
    const combo = errored ? 0 : current.combo;
    if (errored && current.combo > 0) {
      setFlash("zero");
    }
    const next = { ...current, typed: value, clean, combo };
    runRef.current = next;
    setRun(next);
    if (nextMatch.done || isExactAnswer(value, prompt)) {
      finishQuestion("caught");
    }
  };

  if (screen === "lobby") {
    return <Lobby save={save} onStart={beginLevel} />;
  }

  if (screen === "complete" && run) {
    return (
      <ResultScreen
        level={run.level}
        credits={run.credits}
        caught={run.caught}
        missed={run.missed}
        bestCombo={run.bestCombo}
        total={run.prompts.length}
        bestRecord={
          incomplete
            ? save.levelScores[run.level.id] ?? 0
            : Math.max(save.levelScores[run.level.id] ?? 0, run.credits)
        }
        newRecord={newRecord}
        incomplete={incomplete}
        log={run.log}
        onLobby={() => {
          clearIncomplete();
          setRun(null);
          setIncomplete(false);
          setScreen("lobby");
        }}
        onReplay={() => beginLevel(run.level.id)}
      />
    );
  }

  if (!run) {
    return null;
  }

  const isChallenge = run.level.mode === "challenge";
  const questionNo = isChallenge
    ? Math.min(run.caught + run.missed, run.prompts.length)
    : Math.min(run.index + 1, run.prompts.length);
  const questionTotal = run.prompts.length;
  const progressPct = isChallenge
    ? ((run.caught + run.missed) / questionTotal) * 100
    : ((run.index + (run.status === "playing" ? 0 : 1)) / questionTotal) * 100;
  const urgent = isChallenge
    ? challengeUrgent
    : screen === "playing" && run.status === "playing" && run.progress >= 0.72;
  const density = viewportFit.density;
  const tight = density === "tight";
  const shellHeight = viewportFit.height || undefined;
  const narrow = viewportFit.width > 0 && viewportFit.width < 740;
  const keyboardOpen = viewportFit.keyboardOpen;
  const chromeTight = tight || keyboardOpen;
  const compactUi = density !== "roomy" || isPhone;
  const pinViewport = () => {
    window.scrollTo(0, 0);
  };
  const showOverlayPad = !isPhone && !isChallenge;
  const showBelowPad = isPhone || isChallenge;

  const tracePad = (
    <TracePad
      ref={inputRef}
      prompt={isChallenge ? "" : prompt}
      typed={run.typed}
      status={run.status}
      challenge={isChallenge}
      compact={compactUi}
      waiting={screen === "countdown"}
      onChange={onTyped}
      onFocus={() => {
        if (isPhone) {
          pinViewport();
          window.setTimeout(pinViewport, 50);
          window.setTimeout(pinViewport, 280);
        }
      }}
    />
  );

  return (
    <div
      className="gameplay-shell stack-play bg-[#0a0d14]"
      data-gameplay-layout="stack"
      data-density={density}
      data-phone={isPhone ? "true" : "false"}
      data-keyboard={keyboardOpen ? "open" : "closed"}
      style={{
        position: "fixed",
        top: viewportFit.height ? viewportFit.offsetTop : 0,
        left: viewportFit.height ? viewportFit.offsetLeft : 0,
        width: viewportFit.width ? viewportFit.width : "100%",
        height: shellHeight ? `${shellHeight}px` : "100dvh",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <SiteFrame fill>
        <div
          className={cn(
            "mx-auto flex h-full min-h-0 w-full flex-col",
            isChallenge ? "max-w-4xl" : "max-w-3xl",
            shake && "screen-shake"
          )}
          data-play-stack="column"
          style={{
            paddingLeft: "var(--game-pad-x)",
            paddingRight: "var(--game-pad-x)",
            paddingTop: "var(--game-pad-y)",
            paddingBottom: "var(--game-pad-y)",
            gap: 0,
          }}
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <div className="mb-[var(--game-gap)] flex shrink-0 flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.32em] text-[#d7b56a] uppercase">
                Level {run.level.id} · {run.level.englishName}
              </p>
              <h1
                className="font-display game-level-title text-[#f7e7c2]"
                style={{ fontSize: "var(--game-title)" }}
              >
                {run.level.name}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <p className="font-mono text-sm text-[#d8c7a0] tabular-nums">
                {isChallenge
                  ? `${questionNo} / ${questionTotal}`
                  : `第 ${questionNo} / ${questionTotal} 題`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[#e7b0a4] hover:bg-rose-950/40 hover:text-rose-100"
                onClick={(event) => {
                  event.stopPropagation();
                  abandonLevel();
                }}
              >
                放棄本關
              </Button>
            </div>
          </div>
          <div className="mb-[var(--game-gap)] h-1.5 shrink-0 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#c4922e,#ffe9a8)] transition-[width] duration-300"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
          <div className="mb-[var(--game-gap)] shrink-0">
            <CreditsBar
              credits={run.credits}
              combo={run.combo}
              flash={flash}
              lastGain={run.lastGain}
              compact={chromeTight}
            />
          </div>

          <div className="relative min-h-[var(--playfield-min)] flex-1 overflow-hidden rounded-[1.25rem] border border-[rgba(232,196,110,0.22)] bg-[linear-gradient(180deg,rgba(18,22,36,0.94),rgba(8,10,16,0.98))] shadow-[inset_0_0_80px_rgba(232,196,110,0.06)] sm:rounded-[1.6rem]">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,214,120,0.14),transparent)]" />
            {!isChallenge ? (
              <div className="pointer-events-none lane-glow absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 sm:w-36" />
            ) : null}

            <div className="playfield-stage">
              <div className="coin-travel">
                {screen === "playing" && !isChallenge ? (
                  <FallingCoin
                    progress={run.progress}
                    spinning={run.status === "playing"}
                    caught={run.status === "caught"}
                    missed={run.status === "missed"}
                    elapsedMs={run.elapsedMs}
                    compact={compactUi}
                  />
                ) : null}

                {screen === "playing" && isChallenge && viewportFit.width > 0 ? (
                  <ChallengeField
                    level={run.level}
                    prompts={run.prompts}
                    playing={run.status === "playing"}
                    typed={run.typed}
                    compact={compactUi}
                    narrow={narrow}
                    onCatch={onChallengeCatch}
                    onMiss={onChallengeMiss}
                    onComboBreak={onChallengeComboBreak}
                    onUrgent={setChallengeUrgent}
                    onComplete={onChallengeComplete}
                    onConsumeTyped={() => {
                      const current = runRef.current;
                      if (!current) {
                        return;
                      }
                      const cleared = { ...current, typed: "" };
                      runRef.current = cleared;
                      setRun(cleared);
                    }}
                  />
                ) : null}

                {screen === "countdown" ? (
                  <div className="pointer-events-none absolute inset-x-0 top-[6%] z-40 flex justify-center px-3 sm:px-4">
                    <div className="text-center">
                      <p className="text-[11px] tracking-[0.4em] text-[#d7b56a] uppercase">
                        即將開始 · 無法暫停
                      </p>
                      <p
                        className="font-display mt-2 text-[#ffe9a8]"
                        style={{ fontSize: "var(--countdown-num, 4.5rem)" }}
                      >
                        {count > 0 ? count : "GO"}
                      </p>
                    </div>
                  </div>
                ) : null}
                {showOverlayPad ? (
                  <div className="trace-overlay pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-3 sm:px-4">
                    <div className="pointer-events-auto w-full max-w-full">
                      {tracePad}
                    </div>
                  </div>
                ) : null}
              </div>

              {meaningToast ? (
                <MeaningToast
                  word={meaningToast.word}
                  meaning={meaningToast.meaning}
                  toastKey={meaningToast.key}
                />
              ) : null}

              <div className="finish-line" data-finish-line="true">
                <div className="relative w-full px-4 sm:px-6">
                  <div
                    className={cn(
                      "h-1 rounded-full bg-[linear-gradient(90deg,#c4922e,#ffe9a8,#c4922e)] shadow-[0_0_18px_rgba(240,212,138,0.7)]",
                      urgent && "finish-urgent bg-[linear-gradient(90deg,#ff8a6a,#ffd0a8,#ff8a6a)]"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#ead08a]/50 bg-[#1a140c] px-3 py-0.5 text-[10px] tracking-[0.32em] text-[#ffe9a8] uppercase",
                      urgent && "border-rose-300/60 text-rose-100"
                    )}
                  >
                    終點線
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showBelowPad ? (
            <div
              className="mt-[var(--game-gap)] shrink-0"
              onClick={(event) => event.stopPropagation()}
            >
              {tracePad}
            </div>
          ) : null}
        </div>
      </SiteFrame>
    </div>
  );
}
