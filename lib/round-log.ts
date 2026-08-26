import type { LevelId, PromptItem } from "@/lib/levels";

export type RoundEntry = {
  word: string;
  meaning: string;
  correct: boolean;
  levelId: LevelId;
};

export function logPrompt(
  log: RoundEntry[],
  item: PromptItem,
  correct: boolean,
  levelId: LevelId
): RoundEntry[] {
  return [
    ...log,
    {
      word: item.word,
      meaning: item.meaning,
      correct,
      levelId,
    },
  ];
}

export function parseRoundLog(value: unknown): RoundEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const next: RoundEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as Partial<RoundEntry>;
    if (typeof row.word !== "string" || typeof row.meaning !== "string") {
      continue;
    }
    if (row.levelId !== 1 && row.levelId !== 2 && row.levelId !== 3 && row.levelId !== 4) {
      continue;
    }
    next.push({
      word: row.word,
      meaning: row.meaning,
      correct: Boolean(row.correct),
      levelId: row.levelId,
    });
  }
  return next;
}
