"use client";

import { useRef, type CSSProperties } from "react";
import { path } from "@/content/path";
import { person } from "@/content/person";
import styles from "./path.module.css";
import { usePathLine } from "./use-path-line";

/** A name as letters, so each can swing in on the hinge when its stop is reached. */
function Letters({ text }: { text: string }): React.ReactElement {
  return (
    <span className={styles.name}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {/* Words never break inside; spaces stay plain text so names wrap between words. */}
        {text.split(" ").map((word, w, words) => {
          const offset = words.slice(0, w).join(" ").length + (w ? 1 : 0);
          return (
            <span key={w}>
              <span className={styles.word}>
                {Array.from(word).map((char, i) => (
                  <span
                    key={i}
                    className={styles.letter}
                    style={{ "--li": offset + i } as CSSProperties}
                  >
                    {char}
                  </span>
                ))}
              </span>
              {w < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/*
 * "The line becomes his path": the line is pulled out of the title's last letter and runs down
 * the page as his timeline, drawn as you scroll (use-path-line). Each stop lights
 * up when the tip reaches it: its dot fills and its name swings in letter by letter. All of it is
 * plain HTML underneath, readable with no JS at all.
 */
export function Path(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  usePathLine({
    section: sectionRef,
    title: titleRef,
    svg: svgRef,
    path: pathRef,
    stopSelector: `.${styles.stop}`,
    dotSelector: `.${styles.dot}`,
    letterSelector: `.${styles.letter}`,
  });

  const stops = [
    ...path,
    { level: "Now", name: person.role, place: person.skills.join(" · ") },
  ];
  return (
    <section
      ref={sectionRef}
      id="path"
      className={styles.path}
      aria-labelledby="path-title"
    >
      <svg
        ref={svgRef}
        className={styles.svg}
        aria-hidden="true"
        focusable="false"
      >
        <path ref={pathRef} className={styles.stroke} pathLength={1} />
      </svg>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>--EDUCATION: :--PATH:</p>
        <h2 ref={titleRef} id="path-title" className={styles.title}>
          The line becomes his path
        </h2>
        <ol className={styles.stops}>
          {stops.map((stop, i) => (
            <li
              key={stop.name}
              className={styles.stop}
              data-side={i % 2 ? "right" : "left"}
              data-now={i === stops.length - 1 ? "" : undefined}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.level}>{stop.level}</span>
              <Letters text={stop.name} />
              <span className={styles.place}>{stop.place}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
