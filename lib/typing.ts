export type TypeMatch = {
  correctLen: number;
  hasError: boolean;
  done: boolean;
};

export function normalizeAnswer(value: string) {
  return value.replace(/^\s+|\s+$/g, "").toLowerCase();
}

export function isExactAnswer(typed: string, target: string) {
  const a = normalizeAnswer(typed);
  const b = normalizeAnswer(target);
  return a.length > 0 && a === b;
}

export function matchTyped(typed: string, target: string): TypeMatch {
  const al = typed.toLowerCase();
  const bl = target.toLowerCase();
  let correctLen = 0;
  while (correctLen < al.length && correctLen < bl.length && al[correctLen] === bl[correctLen]) {
    correctLen += 1;
  }
  return {
    correctLen,
    hasError: al.length > correctLen,
    done: al === bl && al.length > 0,
  };
}

const COMBO_WEIGHT: Record<number, number> = {
  1: 2,
  2: 8,
  3: 4,
  4: 5,
};

export function comboMultiplier(combo: number) {
  if (combo >= 10) {
    return 1.35;
  }
  if (combo >= 5) {
    return 1.18;
  }
  if (combo >= 2) {
    return 1;
  }
  return 0;
}

export function scoreCatch(opts: {
  levelId: number;
  remaining: number;
  combo: number;
  clean: boolean;
}) {
  const base = 12 * opts.levelId;
  const speed = Math.round(opts.remaining * 22 * opts.levelId);
  const weight = COMBO_WEIGHT[opts.levelId] ?? 3;
  const combo = Math.round(opts.combo * weight * comboMultiplier(opts.combo));
  const clean = opts.clean ? 8 * opts.levelId : 0;
  return Math.max(1, base + speed + combo + clean);
}
