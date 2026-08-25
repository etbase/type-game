"use client";

import { cn } from "@/lib/utils";

type SiteFrameProps = {
  children: React.ReactNode;
  className?: string;
  fill?: boolean;
  contain?: boolean;
};

export function SiteFrame({
  children,
  className,
  fill = false,
  contain = false,
}: SiteFrameProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-x-hidden bg-[#0a0d14]",
        fill
          ? "h-full overflow-hidden"
          : contain
            ? "min-h-full"
            : "min-h-[100vh] min-h-[100dvh] min-h-[100svh]",
        className
      )}
    >
      {children}
    </div>
  );
}
