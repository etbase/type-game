"use client";

type MeaningToastProps = {
  word: string;
  meaning: string;
  toastKey: number;
};

export function MeaningToast({ word, meaning, toastKey }: MeaningToastProps) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[5.25rem] z-[45] flex justify-center sm:bottom-24">
      <div
        key={toastKey}
        className="meaning-toast max-w-[min(92%,26rem)] rounded-full border border-emerald-300/20 bg-[rgba(10,24,18,0.86)] px-3.5 py-1.5 text-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5 leading-tight">
          <span className="font-mono text-[15px] font-semibold tracking-wide text-[#f6ead2]">
            {word}
          </span>
          <span className="text-sm text-emerald-200/95">{meaning}</span>
        </p>
      </div>
    </div>
  );
}
