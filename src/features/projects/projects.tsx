"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { panel, projects, workTagline } from "@/content/projects";
import { openProject, rectOutline } from "@/features/tissue-transition";
import { getLenis } from "@/lib/motion/lenis";
import type { ProjectStrip } from "./project-strip";
import styles from "./projects.module.css";
import { stripGeometry } from "./strip-geometry";
import { useStackSettle } from "./use-stack-settle";

/** Panels for the strip and the tissue sheet (same-origin: no CORS to worry about). */
const textures = projects.map((p) => panel(p.slug, 1400));

/*
 * The work, as on osply.co: one centred column of photos, the current one wide and in colour on
 * the hairline, the one before and after narrower and grey, edge to edge above and below. Along
 * the hairline: the number and services on the left, the list of projects (current in ink) and
 * the sector on the right. Scroll moves the column (sticky stage, settles on a card). The cards
 * are HTML (links, alt text, the no-WebGL view); a three.js strip draws over them and bows like
 * cloth while moving. The centre card opens with the tissue pull.
 */
export function Projects(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fRef = useRef(0);
  useStackSettle(sectionRef, projects.length);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    let frame = 0;
    let strip: ProjectStrip | null = null;
    let cancelled = false;

    const layout = (): void => {
      const g = stripGeometry(stage.clientWidth, stage.clientHeight);
      stage.style.setProperty("--h", `${g.h.toFixed(1)}px`);
      stage.style.setProperty("--wide", `${g.wide.toFixed(1)}px`);
      stage.style.setProperty("--narrow", `${g.narrow.toFixed(1)}px`);
      stage.style.setProperty("--gap", `${g.gap.toFixed(1)}px`);
      strip?.resize();
    };
    const update = (): void => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      fRef.current = p * (projects.length - 1);
      stage.style.setProperty("--f", fRef.current.toFixed(4));
      strip?.setPosition(fRef.current);
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    layout();
    update();
    const resized = new ResizeObserver(() => {
      layout();
      schedule();
    });
    resized.observe(stage);
    window.addEventListener("scroll", schedule, { passive: true });

    // The WebGL strip: fetched as the section approaches, shown once every photo is in.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || strip || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        near.disconnect();
        void import("./project-strip").then(async ({ ProjectStrip }) => {
          if (cancelled) return;
          try {
            const s = new ProjectStrip(canvas, textures);
            s.resize();
            s.setPosition(fRef.current);
            await s.load(textures);
            if (cancelled) return s.dispose();
            strip = s;
            stage.dataset.gl = "";
          } catch {
            // No WebGL: the HTML cards stay.
          }
        });
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(section);

    const onMove = (event: PointerEvent): void => {
      if (!strip || event.pointerType !== "mouse") return;
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-card]");
      if (!card) return strip.setPointer(null);
      const r = card.getBoundingClientRect();
      strip.setPointer(Number(card.dataset.card), (event.clientX - r.left) / r.width, 1 - (event.clientY - r.top) / r.height);
    };
    const onLeave = (): void => strip?.setPointer(null);
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resized.disconnect();
      near.disconnect();
      window.removeEventListener("scroll", schedule);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      strip?.dispose();
    };
  }, []);

  const onOpen = (event: React.MouseEvent<HTMLAnchorElement>, i: number): void => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    const section = sectionRef.current;
    if (!section) return;
    if (Math.abs(i - fRef.current) > 0.3) {
      // Bring it to the centre first.
      const top = section.getBoundingClientRect().top + window.scrollY;
      const y = top + (i / (projects.length - 1)) * (section.offsetHeight - window.innerHeight);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    openProject({ slug: projects[i].slug, image: textures[i], ...rectOutline(rect), from: location.pathname });
  };

  return (
    <section ref={sectionRef} id="projects" className={styles.projects} aria-labelledby="projects-title" style={{ "--n": projects.length } as CSSProperties}>
      <div ref={stageRef} className={styles.stage}>
        <h2 id="projects-title" className="sr-only">
          Projects
        </h2>
        <span className={styles.hairline} aria-hidden="true" />

        <div className={styles.row} aria-hidden="true">
          <span className={`${styles.ticker} ${styles.number}`}>
            <span>
              {projects.map((p, i) => (
                <span key={p.slug}>{i + 1}</span>
              ))}
            </span>
          </span>
          <span className={`${styles.ticker} ${styles.services}`}>
            <span>
              {projects.map((p) => (
                <span key={p.slug}>{p.services}</span>
              ))}
            </span>
          </span>
          <span className={styles.names}>
            <span>
              {projects.map((p, i) => (
                <span key={p.slug} style={{ "--i": i } as CSSProperties}>
                  {p.name}
                </span>
              ))}
            </span>
          </span>
          <span className={`${styles.ticker} ${styles.sector}`}>
            <span>
              {projects.map((p) => (
                <span key={p.slug}>{p.sector}</span>
              ))}
            </span>
          </span>
        </div>

        <ul className={styles.strip}>
          {projects.map((p, i) => (
            <li key={p.slug} className={styles.card} data-card={i} style={{ "--i": i } as CSSProperties}>
              <a href={`/projects/${p.slug}`} className={styles.cardLink} onClick={(event) => onOpen(event, i)} aria-label={`Open ${p.name}: ${p.services}, ${p.sector}`}>
                <Image className={styles.photo} src={panel(p.slug, 1400)} alt={p.panelAlt} fill sizes="(max-width: 48rem) 92vw, 76vw" />
              </a>
              <span className={styles.cardName} aria-hidden="true">
                {p.name}
              </span>
            </li>
          ))}
        </ul>
        <canvas ref={canvasRef} className={styles.gl} aria-hidden="true" />

        <p className={styles.tagline}>{workTagline}</p>
        <p className={styles.footLeft} aria-hidden="true">
          --WORK: {String(projects.length).padStart(3, "0")} PROJECTS
        </p>
        <p className={styles.footRight} aria-hidden="true">
          SCROLL TO BROWSE · CLICK TO OPEN
        </p>
      </div>
    </section>
  );
}
