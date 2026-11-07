import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { CursorReadout } from "@/components/cursor-readout";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Boot } from "@/features/boot/boot";
import { TransitionLayer } from "@/features/tissue-transition";
import { introGateScript } from "@/lib/motion/intro-gate";
import { mono, sans } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "Vedant — Java developer & QA tester",
    template: "%s — Vedant",
  },
  description:
    "Vedant is a Java developer with a tester's eye: Java, Python and the web, built carefully and checked twice. See his projects, education and the path between them.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether the boot loader plays (lib/motion/intro-gate.ts). */}
        <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      </head>
      <body>
        <Boot />
        <SiteHeader />
        {/* The page itself: what the mobile menu presses back (globals.css → html[data-menu]). */}
        <div data-page>{children}</div>
        <CursorReadout />
        <SmoothScroll />
        <TransitionLayer />
      </body>
    </html>
  );
}
