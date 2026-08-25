"use client";

import { useEffect, useRef, useState } from "react";

export type ViewportDensity = "roomy" | "compact" | "tight";

export type ViewportFit = {
  height: number;
  offsetTop: number;
  offsetLeft: number;
  width: number;
  keyboardOpen: boolean;
  isPhone: boolean;
  density: ViewportDensity;
};

const KEYBOARD_DELTA = 120;
const PHONE_MAX_WIDTH = 560;

export function viewportDensity(height: number): ViewportDensity {
  if (height > 0 && height < 540) {
    return "tight";
  }
  if (height > 0 && height < 720) {
    return "compact";
  }
  return "roomy";
}

function isPhoneLike(width: number) {
  if (typeof window === "undefined") {
    return false;
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const hoverNone = window.matchMedia("(hover: none)").matches;
  return width < PHONE_MAX_WIDTH && coarse && hoverNone;
}

function readViewport(baseline: number): ViewportFit & { nextBaseline: number } {
  if (typeof window === "undefined") {
    return {
      height: 0,
      offsetTop: 0,
      offsetLeft: 0,
      width: 0,
      keyboardOpen: false,
      isPhone: false,
      density: "roomy",
      nextBaseline: baseline,
    };
  }

  const vv = window.visualViewport;
  const height = Math.round(vv?.height ?? window.innerHeight);
  const width = Math.round(vv?.width ?? window.innerWidth);
  const offsetTop = Math.round(vv?.offsetTop ?? 0);
  const offsetLeft = Math.round(vv?.offsetLeft ?? 0);
  const isPhone = isPhoneLike(width);
  let nextBaseline = baseline;

  if (nextBaseline === 0 || height > nextBaseline + 40) {
    nextBaseline = height;
  }

  const keyboardOpen = isPhone && nextBaseline - height >= KEYBOARD_DELTA;
  return {
    height,
    offsetTop,
    offsetLeft,
    width,
    keyboardOpen,
    isPhone,
    density: viewportDensity(height),
    nextBaseline,
  };
}

export function useVisualViewport(active: boolean): ViewportFit {
  const baselineRef = useRef(0);
  const orientationRef = useRef("");
  const [fit, setFit] = useState<ViewportFit>({
    height: 0,
    offsetTop: 0,
    offsetLeft: 0,
    width: 0,
    keyboardOpen: false,
    isPhone: false,
    density: "roomy",
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      return;
    }

    const apply = () => {
      const orientation = window.matchMedia("(orientation: portrait)").matches ? "p" : "l";
      if (orientation !== orientationRef.current) {
        orientationRef.current = orientation;
        baselineRef.current = Math.round(window.innerHeight);
      }

      const next = readViewport(baselineRef.current);
      baselineRef.current = next.nextBaseline;
      setFit({
        height: next.height,
        offsetTop: next.offsetTop,
        offsetLeft: next.offsetLeft,
        width: next.width,
        keyboardOpen: next.keyboardOpen,
        isPhone: next.isPhone,
        density: next.density,
      });
    };

    apply();
    const vv = window.visualViewport;
    const pointer = window.matchMedia("(pointer: coarse)");
    const hover = window.matchMedia("(hover: none)");
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    pointer.addEventListener("change", apply);
    hover.addEventListener("change", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      pointer.removeEventListener("change", apply);
      hover.removeEventListener("change", apply);
    };
  }, [active]);

  return fit;
}
