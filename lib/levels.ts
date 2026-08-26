import { ADVANCED_BANK, BEGINNER_BANK, CHALLENGE_BANK, PHRASE_BANK } from "@/lib/word-banks";

export type LevelId = 1 | 2 | 3 | 4;

export type PromptItem = {
  word: string;
  meaning: string;
};

export type LevelMode = "classic" | "challenge";

export type LevelDef = {
  id: LevelId;
  name: string;
  englishName: string;
  blurb: string;
  kind: string;
  pace: string;
  mode: LevelMode;
  prompts: PromptItem[];
  questions: number;
  charMs: number;
  wordMs: number;
  phraseBonusMs: number;
  minMs: number;
  maxMs: number;
};

export const QUESTIONS_PER_LEVEL = 20;

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "入門",
    englishName: "Beginner",
    blurb: "短單字，容錯時間較長。",
    kind: "短單字",
    pace: "慢 · 容錯長",
    mode: "classic",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 280,
    wordMs: 0,
    phraseBonusMs: 0,
    minMs: 6800,
    maxMs: 12000,
    prompts: BEGINNER_BANK,
  },
  {
    id: 2,
    name: "進階",
    englishName: "Advanced",
    blurb: "長單字，節奏快，Combo 加分更高。",
    kind: "長單字",
    pace: "快 · Combo 高",
    mode: "classic",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 250,
    wordMs: 0,
    phraseBonusMs: 0,
    minMs: 4600,
    maxMs: 9800,
    prompts: ADVANCED_BANK,
  },
  {
    id: 3,
    name: "片語",
    englishName: "Phrases",
    blurb: "生活片語，空白鍵必須打對。掉落時間依長度調整。",
    kind: "片語",
    pace: "依長度調整",
    mode: "classic",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 230,
    wordMs: 920,
    phraseBonusMs: 720,
    minMs: 8200,
    maxMs: 18800,
    prompts: PHRASE_BANK,
  },
  {
    id: 4,
    name: "挑戰",
    englishName: "Challenge",
    blurb: "多顆金幣同時落下。打出任一顆上面的英文就能消滅它。",
    kind: "混合多幣",
    pace: "多軌同時",
    mode: "challenge",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 210,
    wordMs: 720,
    phraseBonusMs: 480,
    minMs: 7800,
    maxMs: 14800,
    prompts: CHALLENGE_BANK,
  },
];

export function getLevel(id: LevelId) {
  const level = LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level ${id}`);
  }
  return level;
}

export function shuffle<T>(itemsToShuffle: T[]) {
  const next = [...itemsToShuffle];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function uniquePrompts(prompts: PromptItem[]) {
  const seen = new Set<string>();
  const unique: PromptItem[] = [];
  for (const prompt of prompts) {
    const key = prompt.word.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(prompt);
  }
  return unique;
}

export function dealPrompts(level: LevelDef) {
  const pool = uniquePrompts(level.prompts);
  return shuffle(pool).slice(0, Math.min(level.questions, pool.length));
}

export function promptMetrics(text: string) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const letters = trimmed.replace(/\s/g, "").length;
  return {
    words: words.length,
    letters,
    isPhrase: words.length >= 2,
  };
}

export function fallDurationMs(prompt: PromptItem | string, level: LevelDef) {
  const text = typeof prompt === "string" ? prompt : prompt.word;
  const { words, letters, isPhrase } = promptMetrics(text);
  const extraLetters = Math.max(0, letters - 4);
  const extraWords = Math.max(0, words - 1);
  const raw =
    level.minMs +
    extraLetters * level.charMs +
    extraWords * level.wordMs +
    (isPhrase ? level.phraseBonusMs : 0);
  return Math.min(level.maxMs, Math.max(level.minMs, raw));
}
