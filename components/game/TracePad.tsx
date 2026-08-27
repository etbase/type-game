"use client";

import { matchTyped } from "@/lib/typing";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type TracePadProps = {
  prompt: string;
  typed: string;
  status: "idle" | "playing" | "caught" | "missed";
  challenge?: boolean;
  compact?: boolean;
  rail?: boolean;
  disabled?: boolean;
  reveal?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
};

function traceFontSize(length: number, rail: boolean, compact: boolean) {
  if (rail) {
    if (length > 28) {
      return "0.98rem";
    }
    if (length > 18) {
      return "1.08rem";
    }
    if (length > 12) {
      return "1.16rem";
    }
    return "1.28rem";
  }
  if (compact) {
    return length > 18 ? "1.12rem" : "1.35rem";
  }
  if (length > 24) {
    return "clamp(1.05rem, 3.1vh, 1.65rem)";
  }
  if (length > 14) {
    return "clamp(1.2rem, 3.5vh, 1.95rem)";
  }
  return "clamp(1.4rem, 4.1vh, 2.3rem)";
}

function stackMinEm(length: number) {
  return length > 16 ? 2.8 : 1.5;
}

function displayChar(char: string | undefined) {
  if (!char || char === " ") {
    return "\u00a0";
  }
  return char;
}

export const TracePad = forwardRef<HTMLInputElement, TracePadProps>(
  function TracePad(
    {
      prompt,
      typed,
      status,
      challenge = false,
      compact = false,
      rail = false,
      disabled = false,
      reveal = false,
      onChange,
      onFocus,
    },
    ref
  ) {
    const match = matchTyped(typed, prompt);
    const slots = Math.max(prompt.length, typed.length, 1);
    const fontSize = traceFontSize(Math.max(prompt.length, typed.length), rail, compact);
    const minHeight = `${stackMinEm(Math.max(prompt.length, typed.length, 8))}em`;
    const playing = status === "playing" && !disabled && reveal;
    const hint = status === "missed" ? "Missed" : challenge ? "Type a coin" : "Trace this";
    const showPrompt = reveal && !challenge;
    const showChallengeInk = reveal && challenge && typed.length > 0;

    return (
      <div
        className={cn(
          "trace-pad relative",
          rail
            ? "flex min-h-[4.75rem] w-full flex-1 flex-col overflow-hidden rounded-2xl border px-2 py-2"
            : cn(
                "mx-auto w-[min(100%,42rem)] rounded-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md",
                compact ? "px-3 py-3" : "px-[var(--prompt-pad-x,2rem)] py-[var(--prompt-pad-y,1.4rem)]"
              ),
          status === "missed"
            ? "border-rose-400/40 bg-rose-950/35"
            : "border-[rgba(232,196,110,0.28)] bg-[rgba(12,16,28,0.86)]"
        )}
        data-trace-reveal={reveal ? "true" : "false"}
      >
        <p className="trace-kicker mb-1.5 shrink-0 text-center text-[10px] tracking-[0.38em] text-[#d7b56a]/80 uppercase">
          {hint}
        </p>
        <div className="trace-body relative min-h-0 flex-1" style={{ minHeight, height: minHeight }}>
          <div
            className="trace-stack"
            style={{ fontSize, minHeight, height: minHeight }}
            data-prompt={showPrompt ? prompt : showChallengeInk ? typed : ""}
          >
            <span className="trace-blank" aria-hidden />
            {showPrompt ? (
              <span className="trace-letters">
                {Array.from({ length: slots }, (_, index) => {
                  const reached = index < typed.length;
                  const ok = index < match.correctLen;
                  const caret = playing && index === typed.length;
                  return (
                    <span
                      key={`cell-${index}`}
                      className={cn("trace-cell", caret && "trace-caret")}
                    >
                      <span className="trace-ghost-ch" aria-hidden>
                        {displayChar(prompt[index])}
                      </span>
                      <span
                        className={cn(
                          "trace-ink-ch",
                          reached && ok && "trace-ok",
                          reached && !ok && "trace-bad",
                          !reached && "trace-empty"
                        )}
                        aria-hidden
                      >
                        {displayChar(reached ? typed[index] : prompt[index])}
                      </span>
                    </span>
                  );
                })}
              </span>
            ) : null}
            {showChallengeInk ? (
              <span className="trace-letters">
                {typed.split("").map((char, index) => (
                  <span key={`ch-${index}`} className="trace-cell">
                    <span className="trace-ink-ch">{displayChar(char)}</span>
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </div>
        <input
          ref={ref}
          value={typed}
          type="text"
          name="type-answer"
          inputMode="text"
          lang="en"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onPaste={(event) => event.preventDefault()}
          onFocus={onFocus}
          aria-label="英文輸入"
          aria-describedby="trace-hint"
          className="trace-native-input"
        />
        <p id="trace-hint" className="sr-only">
          {reveal
            ? challenge
              ? "打出畫面金幣上的英文"
              : `請描寫：${prompt}`
            : "打字區"}
        </p>
        {status === "missed" && !challenge ? (
          <p className="mt-1.5 shrink-0 text-center text-[11px] font-medium tracking-widest text-rose-300">
            金幣碰到終點線
          </p>
        ) : null}
        {playing && !challenge && match.hasError ? (
          <p className="trace-error-copy mt-1.5 shrink-0 text-center text-[11px] text-rose-300/90">
            打錯了，請修正後繼續
          </p>
        ) : null}
      </div>
    );
  }
);
