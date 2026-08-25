export const REPO_NAME = "type-game";
export const PAGES_BASE_PATH = `/${REPO_NAME}`;

/**
 * GitHub Pages 專案網站會掛在 /type-game/ 子路徑。
 * 本機 `next dev` 維持根路徑；`next build` / CI 預設加上 /type-game。
 * 可用 NEXT_PUBLIC_BASE_PATH 覆寫（空字串代表強制根路徑）。
 */
export function getBasePath(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_PATH;
  if (typeof fromEnv === "string") {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return PAGES_BASE_PATH;
  }
  return "";
}
