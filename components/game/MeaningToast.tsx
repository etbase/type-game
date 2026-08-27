"use client";

type MeaningToastProps = {
  word: string;
  meaning: string;
  toastKey: number;
  inline?: boolean;
};

export function MeaningToast({ word, meaning, toastKey, inline = false }: MeaningToastProps) {
  return (
    <div
      className={
        inline
          ? "pointer-events-none relative z-[45] flex justify-center"
            : "pointer-events-none absolute inset-x-3 z-[45] flex justify-center"
      }
      style={
        inline
          ? undefined
          : { bottom: "calc(var(--finish-gap, 2.25rem) + 0.35rem)" }
      }
    >
      <div
        key={toastKey}
        className={
          inline
            ? "meaning-toast max-w-full rounded-2xl border border-emerald-300/20 bg-[rgba(10,24,18,0.86)] px-2 py-1 text-center shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
            : "meaning-toast max-w-[min(92%,26rem)] rounded-full border border-emerald-300/20 bg-[rgba(10,24,18,0.86)] px-3 py-1 text-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm"
        }
        role="status"
        aria-live="polite"
      >
        <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5 leading-tight">
          <span className={inline ? "font-mono text-[12px] font-semibold tracking-wide text-[#f6ead2]" : "font-mono text-[15px] font-semibold tracking-wide text-[#f6ead2]"}>
            {word}
          </span>
          <span className={inline ? "text-[11px] text-emerald-200/95" : "text-sm text-emerald-200/95"}>{meaning}</span>
        </p>
      </div>
    </div>
  );
}
