import { fallDurationMs, promptMetrics, type LevelDef, type PromptItem } from "@/lib/levels";

export const CHALLENGE_SHATTER_MS = 380;
export const CHALLENGE_MISS_FADE_MS = 180;
export const LONG_PROMPT_LETTERS = 12;

export type LiveCoinStatus = "falling" | "shattered" | "missed";

export type LiveCoin = {
  id: number;
  prompt: PromptItem;
  lane: number;
  x: number;
  born: number;
  duration: number;
  status: LiveCoinStatus;
  resolvedAt: number;
};

export function challengeMaxAlive(narrow: boolean, resolvedRatio: number, split = false) {
  if (split) {
    return 2;
  }
  if (narrow) {
    return resolvedRatio >= 0.42 ? 3 : 2;
  }
  return resolvedRatio >= 0.35 ? 4 : 3;
}

export function challengeSpawnGapMs(resolvedRatio: number) {
  return Math.round(1520 - resolvedRatio * 520);
}

export function challengeLaneCount(narrow: boolean, split = false) {
  if (split) {
    return 2;
  }
  return narrow ? 3 : 4;
}

export function laneCenter(lane: number, laneCount: number, pad = 16) {
  if (laneCount <= 1) {
    return 50;
  }
  const span = 100 - pad * 2;
  const step = span / (laneCount - 1);
  return pad + step * lane;
}

export function pickLane(live: LiveCoin[], laneCount: number) {
  const nearTop = live
    .filter((coin) => coin.status === "falling" && (performance.now() - coin.born) / coin.duration < 0.38)
    .map((coin) => coin.lane);
  const free: number[] = [];
  for (let i = 0; i < laneCount; i += 1) {
    if (!nearTop.includes(i)) {
      free.push(i);
    }
  }
  const pool = free.length > 0 ? free : Array.from({ length: laneCount }, (_, i) => i);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function durationWithVariance(base: number) {
  return Math.round(base * (0.94 + Math.random() * 0.12));
}

export function isLongPrompt(prompt: PromptItem) {
  return promptMetrics(prompt.word).letters >= LONG_PROMPT_LETTERS || promptMetrics(prompt.word).words >= 3;
}

export function takeNextSpawn(queue: PromptItem[], live: LiveCoin[]) {
  if (queue.length === 0) {
    return null;
  }
  const longFalling = live.some((coin) => coin.status === "falling" && isLongPrompt(coin.prompt));
  if (longFalling) {
    const shortIndex = queue.findIndex((item) => !isLongPrompt(item));
    if (shortIndex >= 0) {
      const next = queue[shortIndex];
      const rest = queue.filter((_, index) => index !== shortIndex);
      return { next, rest };
    }
    return null;
  }
  return { next: queue[0], rest: queue.slice(1) };
}

export function makeLiveCoin(opts: {
  id: number;
  prompt: PromptItem;
  level: LevelDef;
  live: LiveCoin[];
  narrow: boolean;
  split?: boolean;
  now: number;
}): LiveCoin {
  const laneCount = challengeLaneCount(opts.narrow, opts.split);
  const lane = pickLane(opts.live, laneCount);
  const jitter = opts.split ? 0 : (Math.random() - 0.5) * 7;
  const x = opts.split
    ? Math.min(62, Math.max(38, laneCenter(lane, laneCount, 38)))
    : Math.min(88, Math.max(12, laneCenter(lane, laneCount) + jitter));
  return {
    id: opts.id,
    prompt: opts.prompt,
    lane,
    x,
    born: opts.now,
    duration: durationWithVariance(fallDurationMs(opts.prompt, opts.level)),
    status: "falling",
    resolvedAt: 0,
  };
}
