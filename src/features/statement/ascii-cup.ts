import { cup as tune } from "@/lib/motion/tokens";

/*
 * A coffee cup, drawn in code. A shaded field (saucer, cup body, handle, the coffee's surface and
 * three wisps of steam) is sampled on a character grid and printed through a ramp of characters,
 * light to heavy; mid-tones use Java's own glyphs ({ } ; ( ) j a v) so it reads as source code from
 * a step back and as a cup from across the room. The steam drifts; near the pointer the cells
 * scramble and darken (the "reveal"). Renders at a capped frame rate only while on screen.
 */

/** Light → heavy. Mid-weights are code glyphs; picked per cell from a stable hash. */
const RAMP = [" ", " ", ".", "·", ":", "-", "=", "+", "*", "CODE", "CODE", "#", "%", "@"];
const CODE = "{}();=jav<>[]/";
const SCRAMBLE = "01{}();=<>+*#@javclsx";

const hash = (x: number, y: number): number => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Density 0…1 of the scene at (u, v) in [0,1]² (v down), time t (s). Also: is it "hot"? */
function field(u: number, v: number, t: number): { d: number; hot: boolean } {
  let d = 0;
  let hot = false;

  // Saucer: a flat ellipse with a rim, lit from the left.
  const sx = (u - 0.5) / 0.44;
  const sy = (v - 0.9) / 0.055;
  const saucer = sx * sx + sy * sy;
  if (saucer < 1) d = Math.max(d, 0.32 + 0.38 * (1 - Math.abs(sx)) + (saucer > 0.7 ? 0.22 : 0));

  // Cup body: tapers from the rim (v .44, half-width .25) to the foot (v .86, .18), shaded round.
  if (v > 0.44 && v < 0.87) {
    const k = (v - 0.44) / 0.43;
    const half = 0.25 - 0.07 * k + 0.02 * Math.sin(k * Math.PI);
    const x = (u - 0.5) / half;
    if (Math.abs(x) < 1) {
      const round = Math.sqrt(1 - x * x);
      const light = 0.45 + 0.55 * round - 0.25 * smooth(-0.2, 1, x);
      d = Math.max(d, 0.25 + 0.7 * light);
      if (round > 0.55 && x < -0.1 && k > 0.2 && k < 0.8) hot = hash(u * 91, v * 57) > 0.82;
    }
  }

  // Rim and the coffee inside it.
  const rx = (u - 0.5) / 0.25;
  const ry = (v - 0.44) / 0.045;
  const rim = rx * rx + ry * ry;
  if (rim < 1) d = rim > 0.72 ? 0.95 : 0.55 + 0.25 * Math.sin(u * 40 + t * 0.8) * 0.2;

  // Handle: a ring on the right.
  const hx = (u - 0.765) / 0.085;
  const hy = (v - 0.6) / 0.11;
  const ring = Math.sqrt(hx * hx + hy * hy);
  if (ring > 0.62 && ring < 1 && u > 0.73) d = Math.max(d, 0.55 + 0.35 * (1 - Math.abs(ring - 0.81) / 0.19));

  // Steam: three wisps rising off the coffee, swaying, thinning as they climb.
  if (v < 0.42) {
    for (let w = 0; w < 3; w++) {
      const base = 0.42 + (w - 1) * 0.085;
      const rise = (0.42 - v) / 0.42;
      const cx = base + Math.sin(v * 13 + t * 1.3 + w * 2.1) * 0.035 * (0.4 + rise) + Math.sin(v * 5 - t * 0.6 + w) * 0.02;
      const width = 0.012 + 0.03 * rise;
      const s = Math.exp(-((u - cx) * (u - cx)) / (width * width)) * (1 - smooth(0.55, 1, rise)) * (0.55 + 0.45 * Math.sin(v * 22 - t * 2.4 + w * 3));
      d = Math.max(d, s * 0.62);
    }
  }
  return { d, hot };
}

export class AsciiCup {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly cols = tune.cols;
  private readonly rows = tune.rows;
  private cellW = 10;
  private cellH = 16;
  private width = 0;
  private height = 0;
  private pointer: { c: number; r: number } | null = null;
  private frame = 0;
  private last = 0;
  private visible = false;
  private readonly still: boolean;
  private readonly start = performance.now();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly font: string,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cellW = this.width / this.cols;
    this.cellH = this.height / this.rows;
    this.draw(this.elapsed());
  }

  /** Pointer in canvas px, or null. */
  setPointer(x: number | null, y = 0): void {
    this.pointer = x === null ? null : { c: x / this.cellW, r: y / this.cellH };
    if (this.still) this.draw(this.elapsed());
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible && !this.still) this.loop();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.visible = false;
  }

  private elapsed(): number {
    return this.still ? 0 : (performance.now() - this.start) / 1000;
  }

  private loop(): void {
    if (this.frame) return;
    const step = (now: number): void => {
      if (!this.visible) {
        this.frame = 0;
        return;
      }
      if (now - this.last >= 1000 / tune.fps) {
        this.last = now;
        this.draw(this.elapsed());
      }
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  private draw(t: number): void {
    const { ctx, cellW, cellH } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.font = `${Math.round(cellH * 0.82)}px ${this.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tick = Math.floor(t * 12);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const { d, hot } = field((c + 0.5) / this.cols, (r + 0.5) / this.rows, t);
        let near = 0;
        if (this.pointer) {
          const dc = c - this.pointer.c;
          const dr = (r - this.pointer.r) * (cellH / cellW) * 0.6;
          near = Math.max(0, 1 - Math.sqrt(dc * dc + dr * dr) / tune.reveal);
        }
        if (d < 0.08 && near < 0.35) continue;
        let ch: string;
        if (near > 0.35 && d > 0.05) {
          // Revealed: live code, flickering.
          ch = SCRAMBLE[Math.floor(hash(c + tick, r - tick) * SCRAMBLE.length)];
        } else {
          const slot = RAMP[Math.min(RAMP.length - 1, Math.floor(d * RAMP.length))];
          ch = slot === "CODE" ? CODE[Math.floor(hash(c, r) * CODE.length)] : slot;
        }
        if (ch === " ") continue;
        const ink = Math.min(1, 0.25 + d * 0.85 + near * 0.6);
        ctx.fillStyle = hot || (near > 0.6 && d > 0.3) ? `rgba(31, 138, 76, ${ink})` : `rgba(11, 11, 12, ${ink * 0.9})`;
        ctx.fillText(ch, (c + 0.5) * cellW, (r + 0.5) * cellH);
      }
    }
  }
}
