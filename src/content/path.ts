/*
 * Vedant's education, in order. Exact names, degree and years are still to confirm with him
 * (PRD.md → To confirm); years are left out until then rather than guessed.
 */
export interface Stop {
  level: string;
  name: string;
  place: string;
}

export const path: readonly Stop[] = [
  {
    level: "10th",
    name: "St. Dan's English Medium School",
    place: "Secondary school",
  },
  { level: "11th – 12th", name: "Malojiraje", place: "Junior college" },
  { level: "Degree", name: "Jaysingpur College", place: "Jaysingpur" },
];
