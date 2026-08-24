export type LevelId = 1 | 2 | 3 | 4;

export type LevelDef = {
  id: LevelId;
  name: string;
  englishName: string;
  blurb: string;
  prompts: string[];
  questions: number;
  charMs: number;
  minMs: number;
  maxMs: number;
};

export const QUESTIONS_PER_LEVEL = 20;

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "入門",
    englishName: "Beginner",
    blurb: "短單字，金幣落得慢。",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 430,
    minMs: 5600,
    maxMs: 9000,
    prompts: [
      "cat",
      "dog",
      "sun",
      "book",
      "tree",
      "water",
      "happy",
      "friend",
      "school",
      "apple",
      "house",
      "light",
      "music",
      "green",
      "table",
      "chair",
      "phone",
      "window",
      "paper",
      "river",
      "cloud",
      "smile",
      "bread",
      "sleep",
      "winter",
      "family",
    ],
  },
  {
    id: 2,
    name: "進階",
    englishName: "Advanced",
    blurb: "較長單字，節奏加快。",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 360,
    minMs: 5000,
    maxMs: 8800,
    prompts: [
      "because",
      "together",
      "important",
      "beautiful",
      "language",
      "computer",
      "morning",
      "weather",
      "journey",
      "practice",
      "mountain",
      "library",
      "question",
      "elephant",
      "birthday",
      "kitchen",
      "rainbow",
      "student",
      "holiday",
      "umbrella",
      "chocolate",
      "adventure",
      "calendar",
      "sandwich",
      "treasure",
      "tomorrow",
    ],
  },
  {
    id: 3,
    name: "片語",
    englishName: "Phrases",
    blurb: "生活片語，空白鍵也算。",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 300,
    minMs: 6200,
    maxMs: 12500,
    prompts: [
      "good morning",
      "thank you",
      "see you later",
      "how are you",
      "nice to meet you",
      "have a nice day",
      "what time is it",
      "I am hungry",
      "lets go home",
      "wait a minute",
      "of course",
      "after school",
      "on the weekend",
      "take a break",
      "look at this",
      "once upon a time",
      "in the afternoon",
      "a cup of tea",
      "my best friend",
      "practice makes perfect",
      "keep it up",
      "well done",
      "never give up",
      "piece of cake",
      "break a leg",
      "see you soon",
    ],
  },
  {
    id: 4,
    name: "挑戰",
    englishName: "Challenge",
    blurb: "完整句子，金幣仍不停。",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 250,
    minMs: 8000,
    maxMs: 17000,
    prompts: [
      "The early bird catches the worm",
      "Knowledge is power",
      "Practice every day",
      "A journey of a thousand miles",
      "Actions speak louder than words",
      "Better late than never",
      "Every cloud has a silver lining",
      "Honesty is the best policy",
      "Where there is a will there is a way",
      "Time flies when you are having fun",
      "An apple a day keeps the doctor away",
      "The pen is mightier than the sword",
      "Rome was not built in a day",
      "Look before you leap",
      "Two heads are better than one",
      "A picture is worth a thousand words",
      "Fortune favors the brave",
      "The grass is always greener",
      "Strike while the iron is hot",
      "All that glitters is not gold",
      "When in Rome do as the Romans do",
      "Practice makes perfect",
      "Never stop learning English",
      "Make each coin count",
    ],
  },
];

export function getLevel(id: LevelId) {
  const level = LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level ${id}`);
  }
  return level;
}

export function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function dealPrompts(level: LevelDef) {
  return shuffle(level.prompts).slice(0, level.questions);
}

export function fallDurationMs(prompt: string, level: LevelDef) {
  const raw = 1600 + prompt.length * level.charMs;
  return Math.min(level.maxMs, Math.max(level.minMs, raw));
}
