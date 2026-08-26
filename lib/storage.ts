import { parseRoundLog, type RoundEntry } from "@/lib/round-log";
import type { LevelId } from "@/lib/levels";

const SAVE_KEY = "gold-type-challenge-v1";
const RUN_KEY = "gold-type-challenge-run";
const INCOMPLETE_KEY = "gold-type-challenge-incomplete";

export type SaveData = {
  levelScores: Record<LevelId, number>;
  cleared: Record<LevelId, boolean>;
};

export type IncompleteSnapshot = {
  levelId: LevelId;
  caught: number;
  missed: number;
  credits: number;
  bestCombo: number;
  total: number;
  log: RoundEntry[];
};

const emptyScores = (): Record<LevelId, number> => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
});

const emptyCleared = (): Record<LevelId, boolean> => ({
  1: false,
  2: false,
  3: false,
  4: false,
});

export function loadSave(): SaveData {
  if (typeof window === "undefined") {
    return { levelScores: emptyScores(), cleared: emptyCleared() };
  }
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { levelScores: emptyScores(), cleared: emptyCleared() };
    }
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      levelScores: { ...emptyScores(), ...(parsed.levelScores ?? {}) },
      cleared: { ...emptyCleared(), ...(parsed.cleared ?? {}) },
    };
  } catch {
    return { levelScores: emptyScores(), cleared: emptyCleared() };
  }
}

export function writeSave(save: SaveData) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function totalCredits(save: SaveData) {
  return save.levelScores[1] + save.levelScores[2] + save.levelScores[3] + save.levelScores[4];
}

export function markRun(levelId: LevelId) {
  window.sessionStorage.setItem(RUN_KEY, String(levelId));
}

export function clearRun() {
  window.sessionStorage.removeItem(RUN_KEY);
}

export function writeIncomplete(snapshot: IncompleteSnapshot) {
  window.sessionStorage.setItem(INCOMPLETE_KEY, JSON.stringify(snapshot));
}

export function clearIncomplete() {
  window.sessionStorage.removeItem(INCOMPLETE_KEY);
}

export function readIncomplete(): IncompleteSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(INCOMPLETE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as IncompleteSnapshot;
    if (parsed.levelId !== 1 && parsed.levelId !== 2 && parsed.levelId !== 3 && parsed.levelId !== 4) {
      return null;
    }
    return {
      ...parsed,
      log: parseRoundLog(parsed.log),
    };
  } catch {
    return null;
  }
}

export function takeIncomplete(): IncompleteSnapshot | null {
  const snapshot = readIncomplete();
  clearIncomplete();
  window.sessionStorage.removeItem(RUN_KEY);
  return snapshot;
}

export function applyCompleteScore(save: SaveData, levelId: LevelId, credits: number) {
  const previous = save.levelScores[levelId] ?? 0;
  const newRecord = credits > previous;
  if (newRecord) {
    save.levelScores[levelId] = credits;
  }
  save.cleared[levelId] = true;
  return { save, newRecord, bestRecord: Math.max(previous, credits), previous };
}

export function snapshotFromRun(run: {
  level: { id: LevelId; questions: number };
  caught: number;
  missed: number;
  credits: number;
  bestCombo: number;
  prompts: { length: number };
  log: RoundEntry[];
}): IncompleteSnapshot {
  return {
    levelId: run.level.id,
    caught: run.caught,
    missed: run.missed,
    credits: run.credits,
    bestCombo: run.bestCombo,
    total: run.prompts.length,
    log: run.log,
  };
}
