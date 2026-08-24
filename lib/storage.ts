import type { LevelId } from "@/lib/levels";

const SAVE_KEY = "gold-type-challenge-v1";
const RUN_KEY = "gold-type-challenge-run";

export type SaveData = {
  levelScores: Record<LevelId, number>;
  cleared: Record<LevelId, boolean>;
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

export function takeAbandonedRun(): LevelId | null {
  const raw = window.sessionStorage.getItem(RUN_KEY);
  if (!raw) {
    return null;
  }
  window.sessionStorage.removeItem(RUN_KEY);
  const id = Number(raw);
  if (id === 1 || id === 2 || id === 3 || id === 4) {
    return id;
  }
  return null;
}
