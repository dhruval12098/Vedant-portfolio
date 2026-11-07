"use client";

import { useEffect, useRef } from "react";
import styles from "./cursor-readout.module.css";

const pad = (n: number): string => String(Math.max(0, Math.round(n))).padStart(4, "0");

/*
 * The pointer's coordinates, printed beside it like a debugger's overlay: X:0949 Y:0172.
 * Mouse only; written on the next frame after a move (transform + text, nothing else).
 */
export function CursorReadout(): React.ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = (): void => {
      frame = 0;
      el.textContent = `X:${pad(x)} Y:${pad(y)}`;
      el.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    };
    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      el.dataset.on = "";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = (): void => {
      delete el.dataset.on;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return <span ref={ref} className={styles.readout} aria-hidden="true" />;
}
