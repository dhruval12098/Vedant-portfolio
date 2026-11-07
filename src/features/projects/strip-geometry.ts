/*
 * The strip's geometry, shared by the HTML layout (CSS variables) and the WebGL strip, so the two
 * always agree. The centre card is wide; its neighbours are narrower crops of the same height,
 * stacked edge to edge above and below it.
 */
export interface StripGeometry {
  /** Card height, centre card width and neighbour width (px). */
  h: number;
  wide: number;
  narrow: number;
  /** Space between cards (px). */
  gap: number;
}

export function stripGeometry(stageW: number, stageH: number): StripGeometry {
  const phone = stageW < 768;
  // Cards fill most of the stage: the centre one over half its height, 7:5 like the panels.
  const h = stageH * (phone ? 0.43 : 0.54);
  const wide = Math.min(h * 1.4, stageW * (phone ? 0.92 : 0.8));
  return { h, wide, narrow: wide * 0.62, gap: Math.max(4, stageH * 0.006) };
}

/** Distance of card i from the centre, given the scroll position f (in cards). */
export const cardOffset = (i: number, f: number): { d: number; ad: number } => {
  const d = i - f;
  return { d, ad: Math.min(1, Math.abs(d)) };
};
