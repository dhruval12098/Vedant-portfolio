"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { panel, projects } from "@/content/projects";
import { openProject, rectOutline } from "@/features/tissue-transition";
import styles from "./expertise.module.css";

/** One marquee line per project: what it is, said the way the reference says it. */
const line = (i: number): string => {
  const p = projects[i];
  return `${p.name} :: ${p.services.replace(", ", " :: ")} :: ${p.sector} :: `;
};

/*
 * Expertise as moving type: one huge line per project runs sideways; the line under the pointer
 * comes into focus (the rest blur back) and a card follows the pointer with that project's
 * notes. Clicking a line opens its project with the tissue pull, from the card. Focus is pure CSS
 * (:hover); the script only moves the card and says which project it describes.
 */
export function Expertise(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = (): void => {
      frame = 0;
      const r = section.getBoundingClientRect();
      card.style.transform = `translate(${(x - r.left + 24).toFixed(1)}px, ${(y - r.top + 24).toFixed(1)}px)`;
    };
    const onMove = (event: PointerEvent): void => {
      x = event.clientX;
      y = event.clientY;
      const row = (event.target as HTMLElement).closest<HTMLElement>("[data-row]");
      if (row) card.dataset.active = row.dataset.row;
      else delete card.dataset.active;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = (): void => {
      delete card.dataset.active;
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const onOpen = (event: React.MouseEvent<HTMLAnchorElement>, i: number): void => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    const card = cardRef.current;
    const from = card?.dataset.active === String(i) ? card.getBoundingClientRect() : event.currentTarget.getBoundingClientRect();
    openProject({ slug: projects[i].slug, image: panel(projects[i].slug, 1400), ...rectOutline(from), from: location.pathname });
  };

  return (
    <section ref={sectionRef} id="expertise" className={styles.expertise} aria-labelledby="expertise-title">
      <h2 id="expertise-title" className="sr-only">
        Selected work
      </h2>
      <ol className={styles.index} aria-hidden="true">
        {projects.map((p, i) => (
          <li key={p.slug}>{String(i + 1).padStart(3, "0")}</li>
        ))}
        <li>
          <Link href="/projects" tabIndex={-1}>
            MORE+++
          </Link>
        </li>
      </ol>
      <p className={styles.labels} aria-hidden="true">
        <span>--SELECTED WORK:</span>
        <span>:--INITIAL STATE:</span>
        <span>:JAVA / WEB / QA</span>
      </p>

      <ul className={styles.rows}>
        {projects.map((p, i) => (
          <li key={p.slug} className={styles.row} data-row={i} style={{ "--speed": `${44 + i * 9}s`, "--dir": i % 2 ? "reverse" : "normal" } as CSSProperties}>
            <a href={`/projects/${p.slug}`} className={styles.link} onClick={(event) => onOpen(event, i)}>
              <span className="sr-only">
                {p.name}: {p.services}, {p.sector}
              </span>
              <span className={styles.track} aria-hidden="true">
                <span>{line(i).repeat(3)}</span>
                <span>{line(i).repeat(3)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div ref={cardRef} className={styles.card} aria-hidden="true">
        {projects.map((p, i) => (
          <div key={p.slug} className={styles.cardBody} data-for={i}>
            <p className={styles.cardTitle}>::{p.name.toUpperCase()}::</p>
            <ol>
              <li>
                <span>[1]</span> {p.kind.toUpperCase()} :: {p.services.toUpperCase()}.
              </li>
              <li>
                <span>[2]</span> BUILT FOR {p.sector.toUpperCase()}, TESTED BEFORE IT SHIPPED.
              </li>
              <li>
                <span>[3]</span> CLICK TO OPEN THE PROJECT.
              </li>
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
