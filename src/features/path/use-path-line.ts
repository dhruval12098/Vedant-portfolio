"use client";

import { useEffect, type RefObject } from "react";
import { stepSpring, type SpringState } from "@/lib/motion/spring";
import { pathLine } from "@/lib/motion/tokens";

interface Refs {
  section: RefObject<HTMLElement | null>;
  title: RefObject<HTMLElement | null>;
  svg: RefObject<SVGSVGElement | null>;
  path: RefObject<SVGPathElement | null>;
  stopSelector: string;
  dotSelector: string;
  letterSelector: string;
}

interface Point {
  y: number;
  x: SpringState;
}

const r1 = (n: number): string => n.toFixed(1);
/** Glyphs a letter cycles through while it decodes. */
const GLYPHS = "01{}();=<>+*#@/$&";
/** Each letter flickers this long, the next starting this much later (ms). */
const FLICKER = 260;
const STAGGER = 26;

/*
 * The path: one SVG line pulled out of the foot of the title's last letter, curving down to the
 * timeline and running on to the end of the section. As the page scrolls, the line is drawn to
 * the reading line; each stop lights up as the drawn end reaches its dot
 * (data-lit, its letters swing in, in CSS). Near the pointer the line is a string: points pulled
 * toward the pointer on springs, wobbling back when let go. Everything runs on one rAF that
 * sleeps when nothing moves and while the section is off screen.
 */
export function usePathLine({
  section: sectionRef,
  title: titleRef,
  svg: svgRef,
  path: pathRef,
  stopSelector,
  dotSelector,
  letterSelector,
}: Refs): void {
  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!section || !title || !svg || !path) return;
    const stops = Array.from(
      section.querySelectorAll<HTMLElement>(stopSelector),
    );
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Geometry in section px (measured on resize).
    let start = { x: 0, y: 0 };
    let lineX = 0;
    let runTop = 0;
    let curveLen = 0;
    let points: Point[] = [];
    let dotYs: number[] = [];
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let visible = false;
    let lastDrawn = -1;

    // A lit stop's name decodes: each letter flickers through code glyphs, then settles, in turn.
    const decode = (stop: HTMLElement): void => {
      const letters = Array.from(stop.querySelectorAll<HTMLElement>(letterSelector));
      const start = performance.now();
      for (const el of letters) {
        el.dataset.c ??= el.textContent ?? "";
        el.dataset.scramble = "";
      }
      const tick = (now: number): void => {
        let busy = false;
        letters.forEach((el, i) => {
          const t = now - start - i * STAGGER;
          if (t < FLICKER) {
            busy = true;
            el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else if (el.dataset.scramble !== undefined) {
            el.textContent = el.dataset.c ?? "";
            delete el.dataset.scramble;
          }
        });
        if (busy) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const measure = (): void => {
      const s = section.getBoundingClientRect();
      // The foot of the title's last letter: the last character's own box.
      const text =
        title.lastChild?.nodeType === Node.TEXT_NODE
          ? (title.lastChild as Text)
          : null;
      let foot = title.getBoundingClientRect();
      if (text && text.length > 0) {
        const range = document.createRange();
        range.setStart(text, text.length - 1);
        range.setEnd(text, text.length);
        const rects = range.getClientRects();
        if (rects.length) foot = rects[rects.length - 1];
      }
      const fontSize = parseFloat(getComputedStyle(title).fontSize);
      start = {
        x: foot.right - s.left - fontSize * 0.06,
        y: foot.bottom - s.top - fontSize * 0.14,
      };
      const dots = stops.map((stop) =>
        stop.querySelector<HTMLElement>(dotSelector)?.getBoundingClientRect(),
      );
      const first = dots[0];
      lineX = first ? first.left + first.width / 2 - s.left : s.width / 2;
      dotYs = dots.map((d) => (d ? d.top + d.height / 2 - s.top : 0));
      runTop = Math.max(
        start.y + pathLine.curveDrop,
        (dotYs[0] ?? start.y + 200) - pathLine.leadIn,
      );
      const end = s.height;
      const n = Math.max(2, Math.ceil((end - runTop) / pathLine.pointGap));
      const prev = points;
      points = Array.from({ length: n + 1 }, (_, i) => ({
        y: runTop + ((end - runTop) * i) / n,
        x: prev[i]?.x ?? { value: 0, velocity: 0 },
      }));
      svg.setAttribute("viewBox", `0 0 ${r1(s.width)} ${r1(s.height)}`);
      build();
      curveLen = Math.max(1, path.getTotalLength() - (end - runTop));
      lastDrawn = -1;
    };

    // Curve from the letter's foot to the top of the run, then the (springy) run itself.
    const build = (): void => {
      const c1 = { x: start.x + 30, y: start.y + (runTop - start.y) * 0.55 };
      const c2 = { x: lineX, y: runTop - (runTop - start.y) * 0.5 };
      let d = `M${r1(start.x)} ${r1(start.y)} C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(lineX + points[0].x.value)} ${r1(points[0].y)}`;
      for (let i = 1; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        d += ` Q${r1(lineX + a.x.value)} ${r1(a.y)} ${r1(lineX + (a.x.value + b.x.value) / 2)} ${r1((a.y + b.y) / 2)}`;
      }
      const last = points[points.length - 1];
      d += ` L${r1(lineX + last.x.value)} ${r1(last.y)}`;
      path.setAttribute("d", d);
    };

    const step = (): void => {
      frame = 0;
      const s = section.getBoundingClientRect();
      const reading = window.innerHeight * pathLine.readingLine - s.top;
      const dt = 1 / 60;

      // The string: pull toward a nearby pointer, spring back with a wobble.
      let moving = false;
      for (const p of points) {
        let target = 0;
        if (pointer) {
          const dx = pointer.x - lineX;
          const dy = (pointer.y - p.y) / pathLine.pullRadius;
          const reach = Math.max(0, 1 - Math.abs(dx) / pathLine.pullRadius);
          target =
            Math.max(-pathLine.maxPull, Math.min(pathLine.maxPull, dx)) *
            reach *
            Math.exp(-dy * dy);
        }
        stepSpring(p.x, target, pathLine.spring, dt);
        if (
          Math.abs(p.x.value - target) > 0.05 ||
          Math.abs(p.x.velocity) > 0.05
        )
          moving = true;
      }
      if (moving || lastDrawn < 0) build();

      // Drawn length to the reading line: the curve by its height, then the run 1:1.
      const total = path.getTotalLength();
      let drawn: number;
      if (reading <= start.y) drawn = 0;
      else if (reading < runTop)
        drawn = curveLen * ((reading - start.y) / (runTop - start.y));
      else drawn = Math.min(total, curveLen + (reading - runTop));
      const k = still ? 1 : drawn / total;
      path.style.strokeDashoffset = (1 - k).toFixed(5);

      // Stops light up as the tip passes their dot.
      const tipY = still ? Infinity : reading;
      stops.forEach((stop, i) => {
        const lit = tipY >= dotYs[i] - 2;
        if (lit && !stop.hasAttribute("data-lit") && !still) decode(stop);
        stop.toggleAttribute("data-lit", lit);
      });

      const changed = Math.abs(drawn - lastDrawn) > 0.5;
      lastDrawn = drawn;
      if (visible && (moving || changed || pointer))
        frame = requestAnimationFrame(step);
    };
    const wake = (): void => {
      if (visible && !frame) frame = requestAnimationFrame(step);
    };

    const onPointer = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const s = section.getBoundingClientRect();
      const x = event.clientX - s.left;
      pointer =
        Math.abs(x - lineX) < pathLine.pullRadius
          ? { x, y: event.clientY - s.top }
          : null;
      wake();
    };
    const onLeave = (): void => {
      pointer = null;
      wake();
    };

    measure();
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    seen.observe(section);
    const resized = new ResizeObserver(() => {
      measure();
      wake();
    });
    resized.observe(section);
    void document.fonts.ready.then(() => {
      measure();
      wake();
    });
    window.addEventListener("scroll", wake, { passive: true });
    section.addEventListener("pointermove", onPointer, { passive: true });
    section.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      resized.disconnect();
      window.removeEventListener("scroll", wake);
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [
    sectionRef,
    titleRef,
    svgRef,
    pathRef,
    stopSelector,
    dotSelector,
    letterSelector,
  ]);
}
