"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, type CSSProperties } from "react";
import styles from "./mobile-menu.module.css";
import { NAV } from "./nav";

/** The squeeze's release, after which html[data-menu] is cleared. */
const RELEASE_MS = 820;

/*
 * Pins the page's squeeze to what is on screen: the page scales about the viewport's centre and
 * is clipped to the viewport (one card pressed back). globals.css applies it while html[data-menu].
 */
function holdPage(): HTMLElement | null {
  const page = document.querySelector<HTMLElement>("[data-page]");
  if (!page) return null;
  const rect = page.getBoundingClientRect();
  const top = Math.max(0, -rect.top);
  const root = document.documentElement.style;
  root.setProperty("--menu-origin-y", `${top + window.innerHeight / 2}px`);
  root.setProperty("--menu-clip-top", `${top}px`);
  root.setProperty("--menu-clip-bottom", `${Math.max(0, rect.height - top - window.innerHeight)}px`);
  return page;
}

/*
 * Small-screen navigation (from the Drimindesign site): a white sheet that drops from the Menu
 * button while the page behind presses back. The native popover gives open/close, Esc, light
 * dismiss and the top layer; this closes it on navigation and drives the page squeeze.
 */
export function MobileMenu(): React.ReactElement {
  const id = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = (): void => {
    const sheet = sheetRef.current;
    if (sheet?.matches(":popover-open")) sheet.hidePopover();
  };

  useEffect(() => {
    const sheet = sheetRef.current;
    if (sheet?.matches(":popover-open")) sheet.hidePopover();
  }, [pathname]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const root = document.documentElement;
    let release = 0;
    const onToggle = (event: Event): void => {
      window.clearTimeout(release);
      if ((event as ToggleEvent).newState === "open") {
        const page = holdPage();
        // Clip first with square corners, commit, then squeeze: corners and scale ease in together.
        root.dataset.menu = "held";
        if (page) void getComputedStyle(page).clipPath;
        root.dataset.menu = "open";
      } else {
        root.dataset.menu = "held";
        release = window.setTimeout(() => {
          if (root.dataset.menu === "held") delete root.dataset.menu;
        }, RELEASE_MS);
      }
    };
    sheet.addEventListener("beforetoggle", onToggle);
    return () => {
      window.clearTimeout(release);
      sheet.removeEventListener("beforetoggle", onToggle);
      delete root.dataset.menu;
    };
  }, []);

  return (
    <>
      <button type="button" popoverTarget={id} className={styles.trigger}>
        Menu
      </button>
      <div ref={sheetRef} id={id} popover="auto" className={styles.sheet}>
        <nav aria-label="Primary" className={styles.panel}>
          <div className={styles.top}>
            <p>--MENU:</p>
            <button type="button" popoverTarget={id} popoverTargetAction="hide" className={styles.trigger}>
              Close
            </button>
          </div>
          <ul>
            {NAV.map((item, index) => (
              <li key={item.href} className={styles.row} style={{ "--i": index } as CSSProperties}>
                <Link href={item.href} onClick={close} className={styles.link}>
                  <span className={styles.index}>{String(index + 1).padStart(3, "0")}</span>
                  <span>{item.label}</span>
                  <span aria-hidden="true" className={styles.arrow}>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
