/* Motion values (DESIGN.md §5). Durations in ms unless noted. */

/*
 * The boot loader (features/boot), ms from page start; mirrored in boot.module.css. Lines of the
 * "initializing" log type in one after another, the counter runs to 100, the status turns from
 * BOOTING to COMPILING to BUILD SUCCESSFUL, then the sheet lifts off the page.
 */
export const intro = {
  /** Status flips (ms). */
  compiling: 1500,
  success: 2350,
  /** The loader lifts away, and the page is handed over when it has gone. */
  lift: 2700,
  done: 3300,
} as const;

/* The ASCII coffee cup (features/statement): grid, steam and the pointer's reveal. */
export const cup = {
  /** Columns and rows of the character grid. */
  cols: 72,
  rows: 34,
  /** Frames per second for the steam (it is slow smoke: 24 is plenty). */
  fps: 24,
  /** Pointer reveal radius, in cells. */
  reveal: 7,
} as const;

/* The path (features/path): the line drawn to the reading line, and its string-like give. */
export const pathLine = {
  /** Where the line is drawn to, as a share of the viewport height from the top. */
  readingLine: 0.62,
  /** The curve from the title's last letter drops at least this far (px) before the run. */
  curveDrop: 90,
  /** The straight run starts this far (px) above the first stop's dot. */
  leadIn: 90,
  /** Spacing of the run's spring points (px). */
  pointGap: 36,
  /** Pointer reach (px) and the farthest the line is pulled (px). */
  pullRadius: 150,
  maxPull: 56,
  /** Underdamped: let go, it wobbles back like a plucked string. */
  spring: { stiffness: 150, damping: 7 },
} as const;

/* The tissue pull (features/tissue-transition), as on the Drimindesign site. */
export const tissue = {
  openMs: 1500,
  closeMs: 1300,
  /** Navigate once the sheet has nearly covered the screen (the new page renders beneath). */
  navigateAt: 0.9,
  /** The sheet fades into the real hero over this long once both are in place. */
  fadeMs: 260,
  /** Sheet subdivisions per side, by device power. */
  segments: { high: 96, medium: 64, low: 32 },
} as const;
