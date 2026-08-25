"use client";

import { asset, COIN_FRONT } from "@/lib/asset";
import { cn } from "@/lib/utils";

type SiteFrameProps = {
  children: React.ReactNode;
  className?: string;
  fill?: boolean;
  plain?: boolean;
};

export function SiteFrame({ children, className, fill = false, plain = false }: SiteFrameProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-x-hidden",
        fill ? "h-full overflow-hidden" : "min-h-[100vh] min-h-[100dvh]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_480px_at_50%_-8%,rgba(232,196,110,0.18),transparent_58%),radial-gradient(720px_420px_at_100%_100%,rgba(70,96,160,0.14),transparent_52%),linear-gradient(180deg,#121826_0%,#0a0d14_46%,#07080c_100%)]" />
        <div className="gold-dust absolute inset-0 opacity-70" />
        {!plain ? (
          <>
            <div className="absolute top-16 -left-10 h-44 w-44 opacity-[0.14]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(COIN_FRONT)} alt="" className="h-full w-full rotate-[-18deg] object-contain" />
            </div>
            <div className="absolute right-[-1.5rem] bottom-10 h-36 w-36 opacity-[0.12]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(COIN_FRONT)} alt="" className="h-full w-full rotate-[22deg] object-contain" />
            </div>
          </>
        ) : null}
      </div>
      {children}
    </div>
  );
}
