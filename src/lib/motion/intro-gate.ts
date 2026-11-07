import { intro } from "./tokens";

/*
 * Runs before first paint (inlined in <head>): decides whether the boot loader plays and sets
 * html[data-intro] to "play" or "done". It plays on every full load of the home page (a reload
 * included), never with reduced motion; moving between pages inside the site doesn't replay it
 * (this script only runs on a full load, and "done" retires the loader's rules, so a page
 * restored from <Activity> doesn't restart them).
 */
export const introGateScript = `(function(){var d=document.documentElement;try{var home=location.pathname==="/";var still=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!home||still){d.dataset.intro="done";return}d.dataset.intro="play";setTimeout(function(){d.dataset.intro="done";window.dispatchEvent(new Event("intro-done"))},${intro.done})}catch(e){d.dataset.intro="done"}})();`;

/** Resolves once the loader is over (immediately if it isn't playing). */
export function afterIntro(): Promise<void> {
  if (document.documentElement.dataset.intro !== "play") return Promise.resolve();
  return new Promise((resolve) => window.addEventListener("intro-done", () => resolve(), { once: true }));
}
