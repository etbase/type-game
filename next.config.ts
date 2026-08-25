import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { getBasePath } from "./lib/base-path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const basePath = getBasePath();

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  outputFileTracingRoot: dir,
};

export default nextConfig;
