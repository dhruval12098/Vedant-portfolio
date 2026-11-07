"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { getLenis } from "@/lib/motion/lenis";
import { tissue as tune } from "@/lib/motion/tokens";
import { tissue, type TissueOrigin } from "./store";
import type { TissueRenderer } from "./tissue-renderer";
import styles from "./transition-layer.module.css";

const HERO_SELECTOR = "[data-project-hero] img";
/** Last resort only (a navigation that never lands): the sheet stays up until then. */
const HERO_TIMEOUT_MS = 8000;

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

/** Sheet subdivisions for this device: finer where there is power to spare. */
function segments(): number {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (memory < 4 || navigator.hardwareConcurrency < 4) return tune.segments.low;
  return navigator.hardwareConcurrency >= 8 ? tune.segments.high : tune.segments.medium;
}

/*
 * Resolves once `href` is the page on screen and its hero image is decoded and painted, so the
 * sheet never lifts off the old page or an empty hero. Routes kept alive by <Activity> stay in
 * the DOM, hidden: only a hero that is actually rendered counts.
 */
async function heroReady(href: string): Promise<void> {
  const deadline = performance.now() + HERO_TIMEOUT_MS;
  while (performance.now() < deadline) {
    const image =
      location.pathname === href
        ? Array.from(document.querySelectorAll<HTMLImageElement>(HERO_SELECTOR)).find((img) => img.getClientRects().length > 0)
        : undefined;
    if (image) {
      await image.decode().catch(() => undefined);
      await nextFrame();
      await nextFrame();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
}

interface Engine {
  renderer: TissueRenderer | null;
  frame: number;
  progress: number;
  time: number;
}

/* Plays the progress from where it is to `to` over `ms`, linear in time (the shader eases). */
function play(state: Engine, to: number, ms: number, onFrame: (progress: number, done: boolean) => boolean): void {
  const from = state.progress;
  const start = performance.now();
  let last = start;
  const step = (now: number): void => {
    state.time += Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const k = Math.min(1, (now - start) / ms);
    state.progress = from + (to - from) * k;
    state.renderer?.render(state.progress, state.time);
    if (onFrame(state.progress, k >= 1) && k < 1) state.frame = requestAnimationFrame(step);
  };
  state.frame = requestAnimationFrame(step);
}

function canAnimate(): boolean {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return Boolean(document.createElement("canvas").getContext("webgl2"));
}

/*
 * The tissue pull, from the Drimindesign site (mounted once in the root layout, above the page,
 * never catching the pointer). Opening: the clicked card's top-right corner is pinched up, then
 * the sheet is drawn out and spreads to fill the screen; the project page is pushed underneath
 * once the sheet nearly covers it, then the sheet fades into the page's real hero. Returning
 * (Back or the browser's back) runs it backwards into the card, which <Activity> has kept exactly
 * where it was. Without WebGL2 or with reduced motion it simply navigates.
 */
export function TransitionLayer(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine>({ renderer: null, frame: 0, progress: 0, time: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = engine.current;
    const show = (visible: boolean): void => {
      canvas.toggleAttribute("data-active", visible);
    };
    const release = (): void => {
      cancelAnimationFrame(state.frame);
      show(false);
      state.renderer?.dispose();
      state.renderer = null;
      getLenis()?.start();
    };
    const fadeOut = (onDone: () => void): void => {
      const start = performance.now();
      const step = (now: number): void => {
        const opacity = 1 - Math.min(1, (now - start) / tune.fadeMs);
        state.renderer?.render(1, state.time, opacity);
        if (opacity > 0) state.frame = requestAnimationFrame(step);
        else onDone();
      };
      state.frame = requestAnimationFrame(step);
    };

    const open = async (origin: TissueOrigin): Promise<void> => {
      const href = `/projects/${origin.slug}`;
      if (!canAnimate()) {
        router.push(href);
        tissue.setPhase("idle");
        return;
      }
      getLenis()?.stop();
      let renderer: TissueRenderer;
      try {
        const { TissueRenderer } = await import("./tissue-renderer");
        renderer = new TissueRenderer(canvas, segments());
        state.renderer = renderer;
        await renderer.load(origin.image);
        renderer.setOrigin(origin);
        renderer.resize();
      } catch {
        release();
        router.push(href);
        tissue.setPhase("idle");
        return;
      }
      state.progress = 0;
      renderer.render(0, 0);
      show(true);
      let navigated = false;
      play(state, 1, tune.openMs, (progress, done) => {
        if (!navigated && progress >= tune.navigateAt) {
          navigated = true;
          router.push(href);
        }
        if (!done) return true;
        void heroReady(href).then(() =>
          fadeOut(() => {
            show(false);
            getLenis()?.start();
            tissue.setPhase("open");
          }),
        );
        return false;
      });
    };

    const unsubscribe = tissue.subscribe(() => {
      const origin = tissue.origin;
      if (tissue.phase === "opening" && origin) void open(origin);
    });
    const resize = (): void => {
      state.renderer?.resize();
      if (canvas.hasAttribute("data-active")) state.renderer?.render(state.progress, state.time);
    };
    window.addEventListener("resize", resize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", resize);
      release();
    };
  }, [router]);

  // Back on the page the pull started from: cover the screen before the first paint, then pull
  // the sheet back into its card.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const state = engine.current;
    if (!canvas || tissue.phase !== "open") return;
    if (pathname !== tissue.origin?.from) {
      if (!pathname.startsWith("/projects/")) {
        state.renderer?.dispose();
        state.renderer = null;
        tissue.setPhase("idle");
      }
      return;
    }
    const renderer = state.renderer;
    if (!renderer) {
      tissue.setPhase("idle");
      return;
    }
    tissue.setPhase("closing");
    getLenis()?.stop();
    renderer.resize();
    state.progress = 1;
    renderer.render(1, state.time);
    canvas.toggleAttribute("data-active", true);
    play(state, 0, tune.closeMs, (_, done) => {
      if (!done) return true;
      canvas.toggleAttribute("data-active", false);
      renderer.dispose();
      state.renderer = null;
      getLenis()?.start();
      tissue.setPhase("idle");
      return false;
    });
  }, [pathname]);

  return <canvas ref={canvasRef} className={styles.layer} aria-hidden="true" />;
}
