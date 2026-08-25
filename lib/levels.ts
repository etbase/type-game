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

function items(...pairs: Array<[string, string]>): PromptItem[] {
  return pairs.map(([word, meaning]) => ({ word, meaning }));
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "入門",
    englishName: "Beginner",
    blurb: "短單字，金幣落得慢。",
    mode: "classic",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 220,
    wordMs: 0,
    phraseBonusMs: 0,
    minMs: 5600,
    maxMs: 9800,
    prompts: items(
      ["cat", "貓"],
      ["dog", "狗"],
      ["sun", "太陽"],
      ["book", "書"],
      ["tree", "樹"],
      ["water", "水"],
      ["happy", "快樂的"],
      ["friend", "朋友"],
      ["school", "學校"],
      ["apple", "蘋果"],
      ["house", "房子"],
      ["light", "光"],
      ["music", "音樂"],
      ["green", "綠色的"],
      ["table", "桌子"],
      ["chair", "椅子"],
      ["phone", "電話"],
      ["window", "窗戶"],
      ["paper", "紙"],
      ["river", "河"],
      ["cloud", "雲"],
      ["smile", "微笑"],
      ["bread", "麵包"],
      ["sleep", "睡覺"],
      ["winter", "冬天"],
      ["family", "家人"]
    ),
  },
  {
    id: 2,
    name: "進階",
    englishName: "Advanced",
    blurb: "較長單字，節奏加快。",
    mode: "classic",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 280,
    wordMs: 0,
    phraseBonusMs: 0,
    minMs: 5400,
    maxMs: 11200,
    prompts: items(
      ["because", "因為"],
      ["together", "一起"],
      ["important", "重要的"],
      ["beautiful", "美麗的"],
      ["language", "語言"],
      ["computer", "電腦"],
      ["morning", "早上"],
      ["weather", "天氣"],
      ["journey", "旅程"],
      ["practice", "練習"],
      ["mountain", "山"],
      ["library", "圖書館"],
      ["question", "問題"],
      ["elephant", "大象"],
      ["birthday", "生日"],
      ["kitchen", "廚房"],
      ["rainbow", "彩虹"],
      ["student", "學生"],
      ["holiday", "假日"],
      ["umbrella", "雨傘"],
      ["chocolate", "巧克力"],
      ["adventure", "冒險"],
      ["calendar", "日曆"],
      ["sandwich", "三明治"],
      ["treasure", "寶藏"],
      ["tomorrow", "明天"]
    ),
  },
  {
    id: 3,
    name: "片語",
    englishName: "Phrases",
    blurb: "生活片語，空白鍵也算。",
    mode: "classic",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 200,
    wordMs: 780,
    phraseBonusMs: 650,
    minMs: 7400,
    maxMs: 16800,
    prompts: items(
      ["good morning", "早安"],
      ["thank you", "謝謝"],
      ["see you later", "待會見"],
      ["how are you", "你好嗎"],
      ["nice to meet you", "很高興認識你"],
      ["have a nice day", "祝你有美好的一天"],
      ["what time is it", "現在幾點"],
      ["I am hungry", "我餓了"],
      ["lets go home", "我們回家吧"],
      ["wait a minute", "等一下"],
      ["of course", "當然"],
      ["after school", "放學後"],
      ["on the weekend", "在週末"],
      ["take a break", "休息一下"],
      ["look at this", "看看這個"],
      ["once upon a time", "從前從前"],
      ["in the afternoon", "在下午"],
      ["a cup of tea", "一杯茶"],
      ["my best friend", "我最好的朋友"],
      ["practice makes perfect", "熟能生巧"],
      ["keep it up", "繼續保持"],
      ["well done", "做得好"],
      ["never give up", "永不放棄"],
      ["piece of cake", "輕而易舉"],
      ["break a leg", "祝你好運"],
      ["see you soon", "很快再見"]
    ),
  },
  {
    id: 4,
    name: "挑戰",
    englishName: "Challenge",
    blurb: "多顆金幣同時落下。打出任一顆上面的英文就能消滅它。",
    mode: "challenge",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 210,
    wordMs: 720,
    phraseBonusMs: 480,
    minMs: 7800,
    maxMs: 14800,
    prompts: items(
      ["apple", "蘋果"],
      ["beautiful", "美麗的"],
      ["take care", "保重"],
      ["chocolate", "巧克力"],
      ["good morning", "早安"],
      ["never give up", "永不放棄"],
      ["treasure", "寶藏"],
      ["see you soon", "很快再見"],
      ["umbrella", "雨傘"],
      ["well done", "做得好"],
      ["adventure", "冒險"],
      ["thank you", "謝謝"],
      ["rainbow", "彩虹"],
      ["keep it up", "繼續保持"],
      ["language", "語言"],
      ["of course", "當然"],
      ["calendar", "日曆"],
      ["wait a minute", "等一下"],
      ["journey", "旅程"],
      ["piece of cake", "輕而易舉"],
      ["computer", "電腦"],
      ["take a break", "休息一下"],
      ["elephant", "大象"],
      ["break a leg", "祝你好運"]
    ),
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

export function dealPrompts(level: LevelDef) {
  return shuffle(level.prompts).slice(0, level.questions);
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
