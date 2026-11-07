import type Lenis from "lenis";

/* The one Lenis instance (components/smooth-scroll.tsx), for code that must pause scrolling. */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null): void => {
  instance = lenis;
};

export const getLenis = (): Lenis | null => instance;
