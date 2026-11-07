"use client";

import { useEffect } from "react";
import { afterIntro } from "@/lib/motion/intro-gate";
import { setLenis } from "@/lib/motion/lenis";

/*
 * Site-wide Lenis, the one scroll clock. Loaded after the intro (it is not needed to paint) and
 * skipped with reduced motion, where native scrolling is the honest choice.
 */
export function SmoothScroll(): null {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop = (): void => {};
    let cancelled = false;
    void afterIntro()
      .then(() => import("lenis"))
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
        setLenis(lenis);
        stop = () => {
          setLenis(null);
          lenis.destroy();
        };
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);
  return null;
}
