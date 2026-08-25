"use client";

import { useEffect, useRef, useState } from "react";

export type ViewportFit = {
  height: number;
  offsetTop: number;
  offsetLeft: number;
  width: number;
  keyboardOpen: boolean;
  isPhone: boolean;
};

const KEYBOARD_DELTA = 120;
const PHONE_MAX_WIDTH = 560;

function readViewport(baseline: number): ViewportFit & { nextBaseline: number } {
  if (typeof window === "undefined") {
    return {
      height: 0,
      offsetTop: 0,
      offsetLeft: 0,
      width: 0,
      keyboardOpen: false,
      isPhone: false,
      nextBaseline: baseline,
    };
  }

  const vv = window.visualViewport;
  const height = Math.round(vv?.height ?? window.innerHeight);
  const width = Math.round(vv?.width ?? window.innerWidth);
  const offsetTop = Math.round(vv?.offsetTop ?? 0);
  const offsetLeft = Math.round(vv?.offsetLeft ?? 0);
  const isPhone = window.innerWidth < PHONE_MAX_WIDTH;
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
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      return;
    }

    const update = () => {
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
      });
    };

    update();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [active]);

  return fit;
}
