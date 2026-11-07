import localFont from "next/font/local";

/*
 * Monoid: the whole site speaks in one coding face, like a terminal. Both variables point at it,
 * so every component's display and body type is the same family.
 */
export const mono = localFont({
  src: [
    { path: "./fonts/monoid-regular.woff2", weight: "400" },
    { path: "./fonts/monoid-bold.woff2", weight: "700" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["Cascadia Mono", "Consolas", "ui-monospace", "monospace"],
});

/* Manrope, one weight: only for the small project names on the strip's cards. */
export const sans = localFont({
  src: "./fonts/manrope-medium.woff2",
  variable: "--font-sans",
  weight: "500",
  display: "swap",
  preload: false,
});
