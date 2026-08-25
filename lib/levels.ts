export type LevelId = 1 | 2 | 3 | 4;

export type PromptItem = {
  word: string;
  meaning: string;
};

export type LevelDef = {
  id: LevelId;
  name: string;
  englishName: string;
  blurb: string;
  prompts: PromptItem[];
  questions: number;
  charMs: number;
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
    questions: QUESTIONS_PER_LEVEL,
    charMs: 430,
    minMs: 5600,
    maxMs: 9000,
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
    questions: QUESTIONS_PER_LEVEL,
    charMs: 360,
    minMs: 5000,
    maxMs: 8800,
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
    questions: QUESTIONS_PER_LEVEL,
    charMs: 300,
    minMs: 6200,
    maxMs: 12500,
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
    blurb: "完整句子，金幣仍不停。",
    questions: QUESTIONS_PER_LEVEL,
    charMs: 250,
    minMs: 8000,
    maxMs: 17000,
    prompts: items(
      ["The early bird catches the worm", "早起的鳥兒有蟲吃"],
      ["Knowledge is power", "知識就是力量"],
      ["Practice every day", "每天練習"],
      ["A journey of a thousand miles", "千里之行，始於足下"],
      ["Actions speak louder than words", "行動勝於言語"],
      ["Better late than never", "遲做總比不做好"],
      ["Every cloud has a silver lining", "黑暗中總有一線光明"],
      ["Honesty is the best policy", "誠實為上策"],
      ["Where there is a will there is a way", "有志者事竟成"],
      ["Time flies when you are having fun", "快樂的時光過得特別快"],
      ["An apple a day keeps the doctor away", "一天一蘋果，醫生遠離我"],
      ["The pen is mightier than the sword", "文勝於武"],
      ["Rome was not built in a day", "羅馬不是一天造成的"],
      ["Look before you leap", "三思而後行"],
      ["Two heads are better than one", "人多智慧高"],
      ["A picture is worth a thousand words", "一圖勝千言"],
      ["Fortune favors the brave", "幸運眷顧勇者"],
      ["The grass is always greener", "這山望著那山高"],
      ["Strike while the iron is hot", "打鐵趁熱"],
      ["All that glitters is not gold", "閃閃發亮的不都是金子"],
      ["When in Rome do as the Romans do", "入鄉隨俗"],
      ["Practice makes perfect", "熟能生巧"],
      ["Never stop learning English", "永遠不要停止學英文"],
      ["Make each coin count", "讓每一枚金幣都算數"]
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

export function fallDurationMs(prompt: PromptItem | string, level: LevelDef) {
  const text = typeof prompt === "string" ? prompt : prompt.word;
  const raw = 1600 + text.length * level.charMs;
  return Math.min(level.maxMs, Math.max(level.minMs, raw));
}
