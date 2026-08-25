"use client";

import { useEffect, useRef, useState } from "react";

export type ViewportFit = {
  height: number;
  offsetTop: number;
  offsetLeft: number;
  width: number;
  keyboardOpen: boolean;
};

const KEYBOARD_DELTA = 120;

export function useVisualViewport(active: boolean): ViewportFit {
  const baselineRef = useRef(0);
  const orientationRef = useRef("");
  const [fit, setFit] = useState<ViewportFit>({
    height: 0,
    offsetTop: 0,
    offsetLeft: 0,
    width: 0,
    keyboardOpen: false,
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      return;
    }

    const update = () => {
      const vv = window.visualViewport;
      const height = Math.round(vv?.height ?? window.innerHeight);
      const width = Math.round(vv?.width ?? window.innerWidth);
      const offsetTop = Math.round(vv?.offsetTop ?? 0);
      const offsetLeft = Math.round(vv?.offsetLeft ?? 0);
      const orientation = width > height ? "l" : "p";

      if (orientation !== orientationRef.current) {
        orientationRef.current = orientation;
        baselineRef.current = height;
      } else if (height > baselineRef.current + 40) {
        baselineRef.current = height;
      } else if (baselineRef.current === 0) {
        baselineRef.current = height;
      }

      const keyboardOpen = baselineRef.current - height >= KEYBOARD_DELTA;
      setFit({ height, offsetTop, offsetLeft, width, keyboardOpen });
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
