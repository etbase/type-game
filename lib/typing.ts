export type TypeMatch = {
  correctLen: number;
  hasError: boolean;
  done: boolean;
};

export function matchTyped(typed: string, target: string): TypeMatch {
  const a = typed;
  const b = target;
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
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

export function scoreCatch(opts: {
  levelId: number;
  remaining: number;
  combo: number;
  clean: boolean;
}) {
  const base = 12 * opts.levelId;
  const speed = Math.round(opts.remaining * 22 * opts.levelId);
  const combo = opts.combo * 3;
  const clean = opts.clean ? 8 * opts.levelId : 0;
  return base + speed + combo + clean;
}
