"use client";

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/lib/motion/lenis";

/** Quiet time after the last scroll before the stack settles (ms). */
const QUIET = 160;
/** Ignore settling when already this close to a card (share of one card's travel). */
const NEAR = 0.02;

/*
 * When scrolling stops inside the projects stack, it eases on to the nearest card, like a
 * carousel coming to rest, so one project is always centred and readable. Only inside the
 * sticky travel; never fights a scroll in progress.
 */
export function useStackSettle(sectionRef: RefObject<HTMLElement | null>, count: number): void {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count < 2) return;
    let timer = 0;
    let settling = false;
    const settle = (): void => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      const k = (window.scrollY - top) / travel;
      if (k <= 0 || k >= 1) return;
      const steps = count - 1;
      const nearest = Math.round(k * steps) / steps;
      if (Math.abs(k - nearest) * steps < NEAR) return;
      const y = top + nearest * travel;
      const lenis = getLenis();
      settling = true;
      if (lenis) lenis.scrollTo(y, { duration: 0.7, onComplete: () => (settling = false) });
      else {
        window.scrollTo({ top: y, behavior: "smooth" });
        settling = false;
      }
    };
    const onScroll = (): void => {
      if (settling) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, QUIET);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionRef, count]);
}
