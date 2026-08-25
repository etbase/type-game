export function accuracyPct(caught: number, missed: number) {
  const attempts = caught + missed;
  if (attempts <= 0) {
    return 0;
  }
  return Math.round((caught / attempts) * 100);
}
