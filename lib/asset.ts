import { getBasePath } from "@/lib/base-path";

export const COIN_SPIN_FRAMES = [
  "/coins/coin-front.png",
  "/coins/coin-turn-right.png",
  "/coins/coin-edge.png",
  "/coins/coin-turn-left.png",
] as const;

export const COIN_SPARKLE = "/coins/coin-sparkle.png";
export const COIN_FRONT = "/coins/coin-front.png";

export function asset(path: string | undefined) {
  const value = path || COIN_FRONT;
  const base = getBasePath();
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalized}`;
}
