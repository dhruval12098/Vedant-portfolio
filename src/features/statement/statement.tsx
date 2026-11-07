"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { person } from "@/content/person";
import styles from "./statement.module.css";

/** The statement: plain words and underlined phrases (the parts that are the work). */
const STATEMENT: readonly (string | { u: string; after?: string })[] = [
  "I write Java that holds up — turning ",
  { u: "a loose requirement" },
  " into ",
  { u: "clean, tested code", after: "," },
  " writing ",
  { u: "test cases that catch the bug first", after: "," },
  " and shipping ",
  { u: "releases people can trust", after: "." },
];

/*
 * The first screen after the boot: what Vedant does, in one sentence, over a coffee cup drawn in
 * code (ascii-cup.ts). The words rise in as the loader lifts (CSS); the cup is drawn on a canvas
 * that sleeps off screen. The cup is decoration: the sentence is the content.
 */
export function Statement(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    let dispose = (): void => {};
    let cancelled = false;
    void Promise.all([import("./ascii-cup"), document.fonts.ready]).then(([{ AsciiCup }]) => {
      if (cancelled) return;
      let cup: InstanceType<typeof AsciiCup>;
      try {
        cup = new AsciiCup(canvas, getComputedStyle(canvas).fontFamily);
      } catch {
        return;
      }
      const seen = new IntersectionObserver(([entry]) => cup.setVisible(entry.isIntersecting));
      seen.observe(canvas);
      const resized = new ResizeObserver(() => cup.resize());
      resized.observe(canvas);
      const onMove = (event: PointerEvent): void => {
        const r = canvas.getBoundingClientRect();
        cup.setPointer(event.clientX - r.left, event.clientY - r.top);
      };
      const onLeave = (): void => cup.setPointer(null);
      box.addEventListener("pointermove", onMove, { passive: true });
      box.addEventListener("pointerleave", onLeave, { passive: true });
      dispose = () => {
        seen.disconnect();
        resized.disconnect();
        box.removeEventListener("pointermove", onMove);
        box.removeEventListener("pointerleave", onLeave);
        cup.dispose();
      };
    });
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  let w = 0;
  return (
    <section className={styles.statement} aria-labelledby="statement">
      <p className={styles.labels} aria-hidden="true">
        <span>--METHOD:</span>
        <span>:--PIPELINE:</span>
        <span>:JAVA / QA</span>
      </p>
      <h1 id="statement" className={styles.sentence}>
        <span className="sr-only">{person.name}, Java developer and QA tester. </span>
        {STATEMENT.map((part, i) => {
          const text = typeof part === "string" ? part : part.u;
          const words = text.split(/(\s+)/).map((word, j) =>
            /^\s+$/.test(word) || word === "" ? (
              word
            ) : (
              <span key={j} className={styles.word} style={{ "--w": w++ } as CSSProperties}>
                {word}
              </span>
            ),
          );
          // An underlined phrase stays on one line with the punctuation that follows it.
          return typeof part === "string" ? (
            <span key={i}>{words}</span>
          ) : (
            <span key={i} className={styles.keep}>
              <span className={styles.under}>{words}</span>
              {part.after}
            </span>
          );
        })}
      </h1>
      <div ref={boxRef} className={styles.cupBox}>
        <canvas ref={canvasRef} className={styles.cup} aria-hidden="true" />
        <p className={styles.file} aria-hidden="true">
          --FILE [HOVER TO REVEAL]:
          <span>:coffee.java</span>
        </p>
      </div>
    </section>
  );
}
