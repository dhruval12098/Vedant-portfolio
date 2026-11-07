/*
 * The work. Images and the facts of each project come from the Drimindesign case studies
 * (public/projects/ copies their files). Vedant's role and the testing notes are drafts written
 * from the work itself, to confirm with him (PLAN.md → Open).
 */

export interface CaseImage {
  /** Path without width and extension: /projects/<slug>/<name>. */
  src: string;
  /** Width / height of the file. */
  ratio: number;
  alt: string;
  /** Widths available on disk (smallest first). */
  widths: readonly number[];
}

export type CaseSection =
  /** App screens in a row (a swipeable strip on phones). */
  | { kind: "screens"; images: readonly CaseImage[]; caption?: string }
  /** One image across the content width. */
  | { kind: "wide"; image: CaseImage; caption?: string }
  /** Two images side by side (stacked on phones). */
  | { kind: "pair"; images: readonly [CaseImage, CaseImage]; caption?: string }
  /** A short chapter of the story, numbered like a log entry. */
  | { kind: "chapter"; title: string; body: string }
  /** A checklist: what was built and how it was tested. */
  | { kind: "checks"; title: string; items: readonly string[] };

export interface Project {
  slug: string;
  name: string;
  kind: string;
  /** What he did on it, as on the stack's left column. */
  services: string;
  /** Who it was for, as on the stack's far right. */
  sector: string;
  client: string;
  year: string;
  /** His part, in a line. */
  role: string;
  /** One or two sentences, set large under the hero. */
  intro: string;
  /** Short line for cards and meta descriptions. */
  summary: string;
  /** The 7:5 panel (strip card, tissue sheet, project hero): /projects/<slug>-v2-<w>.webp. */
  panelAlt: string;
  sections: readonly CaseSection[];
}

/** Panel image (7:5) at one of its widths. */
export const panel = (slug: string, width: 700 | 1000 | 1400 = 1400): string => `/projects/${slug}-v2-${width}.webp`;
export const PANEL_RATIO = 1.4;

/** The largest file of a case image. */
export const caseSrc = (image: CaseImage, width = image.widths[image.widths.length - 1]): string => `${image.src}-${width}.webp`;

const shot = (slug: string, name: string, ratio: number, alt: string, widths: readonly number[]): CaseImage => ({
  src: `/projects/${slug}/${name}`,
  ratio,
  alt,
  widths,
});
const SCREEN = 0.449;
const SPEAKORA_SCREEN = 0.4401;
const screen = (slug: string, name: string, alt: string, ratio = SCREEN): CaseImage => shot(slug, name, ratio, alt, [800, 1600]);
const showcase = (slug: string, alt: string): CaseImage => shot(slug, "showcase", 1.5, alt, [800, 1536]);
const detail = (slug: string, which: "a" | "b", alt: string): CaseImage => shot(slug, `detail-${which}`, 2 / 3, alt, [800, 1024]);

/** The line under the stack. */
export const workTagline = "Software that holds up: written in Java, proven by testing, shipped with care.";

export const projects: readonly Project[] = [
  {
    slug: "house-of-diams",
    name: "House of Diams",
    kind: "Website",
    services: "Web Development, QA",
    sector: "Jewellery",
    client: "House of Diams",
    year: "2025",
    role: "Storefront and admin development, testing",
    intro:
      "A jewellery store that sells the feeling of a forever moment, with an admin panel the team can run without training. Built, then tested end to end before a single ring went on sale.",
    summary: "A luxury jewellery storefront and its admin panel, built and tested end to end.",
    panelAlt: "House of Diams luxury jewellery website open on a laptop beside a diamond ring in a velvet box",
    sections: [
      {
        kind: "wide",
        image: showcase("house-of-diams", "The House of Diams admin dashboard on a large monitor in a jewellery studio"),
        caption: "Behind the shop window, a calm dashboard for orders, products and enquiries.",
      },
      {
        kind: "chapter",
        title: "The brief",
        body: "A storefront with the quiet confidence of a high-street jeweller, and a back office the team can run without training: orders, products and enquiries always one click away.",
      },
      {
        kind: "pair",
        images: [
          detail("house-of-diams", "a", "A hand holding a phone showing the House of Diams shop by category grid"),
          detail("house-of-diams", "b", "A diamond ring on champagne silk beside a card with the House of Diams wordmark"),
        ],
        caption: "Rings first, everything else out of the way.",
      },
      {
        kind: "checks",
        title: "Built and tested",
        items: [
          "Product catalogue and category pages, fed from the admin panel.",
          "Admin flows for orders, products and enquiries, each checked against the brief.",
          "Test cases for the paths that cost money: product pages, enquiry forms, order states.",
          "Cross-browser and phone checks before launch, so large photography never slows the page.",
        ],
      },
      {
        kind: "chapter",
        title: "The result",
        body: "On the storefront, large photography and generous space let each piece take its time. In the admin panel, the team found what they needed without a manual.",
      },
    ],
  },
  {
    slug: "shreeram-milks",
    name: "Shreeram Milks",
    kind: "App",
    services: "App Development, QA",
    sector: "Dairy",
    client: "ShreeRam Milks",
    year: "2025",
    role: "App flows and testing",
    intro:
      "A milk-delivery app that gets a new customer from download to their first morning delivery in under a minute: four screens, one decision each, each one tested on real phones.",
    summary: "A milk-delivery app: from download to the first morning delivery in under a minute.",
    panelAlt: "ShreeRam Milks app screens: welcome, phone sign-in, code verification and delivery address",
    sections: [
      {
        kind: "screens",
        images: [
          screen("shreeram-milks", "welcome", "ShreeRam Milks welcome screen: farm fresh milk, delivered before dawn"),
          screen("shreeram-milks", "sign-in", "Sign-in screen with phone number and Google options"),
          screen("shreeram-milks", "verify", "Six-digit code verification screen with a number pad"),
          screen("shreeram-milks", "address", "Delivery address screen with a morning delivery slot"),
        ],
        caption: "Four screens, one decision each: welcome, sign in, verify, deliver.",
      },
      {
        kind: "chapter",
        title: "The approach",
        body: "Phone number first, because that's how milk is ordered today. The delivery slot comes before payment, so customers see the promise before the price.",
      },
      {
        kind: "wide",
        image: showcase("shreeram-milks", "A phone showing the ShreeRam Milks home screen beside a glass bottle of milk on a doorstep"),
        caption: "Made for the doorstep at dawn.",
      },
      {
        kind: "checks",
        title: "Built and tested",
        items: [
          "Sign-in by phone number with a six-digit code, and the edge cases: wrong code, expired code, resend.",
          "Address and delivery-slot flow, with a recommended slot so most people never have to think.",
          "Large tap targets checked on small phones, for early-morning thumbs.",
          "Regression passes on every build before it reached a tester's phone.",
        ],
      },
      {
        kind: "pair",
        images: [
          detail("shreeram-milks", "a", "A phone showing the ShreeRam Milks cart screen beside a glass of milk"),
          detail("shreeram-milks", "b", "A hand holding a phone showing the ShreeRam Milks profile screen"),
        ],
      },
    ],
  },
  {
    slug: "speakora-onboarding",
    name: "Speakora",
    kind: "App",
    services: "App Development, Testing",
    sector: "Education",
    client: "Speakora",
    year: "2025",
    role: "Onboarding flow and testing",
    intro:
      "The onboarding for an English-speaking app: it tests a learner's level while feeling like the first lesson. Five steps, a progress bar, and a reward at the end.",
    summary: "An English-speaking app's onboarding that tests your level and feels like a first lesson.",
    panelAlt: "Speakora onboarding screens: username, interests, English test, reading test and completion",
    sections: [
      {
        kind: "screens",
        images: [
          screen("speakora-onboarding", "username", "Step one: create your username", SPEAKORA_SCREEN),
          screen("speakora-onboarding", "interests", "Step two: select your interests from a grid", SPEAKORA_SCREEN),
          screen("speakora-onboarding", "english-test", "Step three: choose a speaking or reading test", SPEAKORA_SCREEN),
          screen("speakora-onboarding", "reading-test", "Step four: read a paragraph aloud while recording", SPEAKORA_SCREEN),
          screen("speakora-onboarding", "done", "Congratulations screen with an earned XP bonus", SPEAKORA_SCREEN),
        ],
        caption: "Five steps with a progress bar, so the test never feels open-ended.",
      },
      {
        kind: "chapter",
        title: "The idea",
        body: "Placement tests feel like exams. This one feels like practice: you pick your interests, speak a little, and finish with a reward.",
      },
      {
        kind: "wide",
        image: showcase("speakora-onboarding", "A learner wearing an earbud practises speaking with the Speakora app on a phone stand"),
        caption: "Built for speaking out loud, anywhere there's a desk and a window.",
      },
      {
        kind: "checks",
        title: "Built and tested",
        items: [
          "The five-step flow with its progress bar, and what happens when a learner goes back a step.",
          "Recording for the reading test: permission denied, silence, background noise.",
          "Interest selection limits and the empty state, checked screen by screen.",
          "The completion reward credited once, however many times the last screen is opened.",
        ],
      },
      {
        kind: "pair",
        images: [
          detail("speakora-onboarding", "a", "A hand holding a phone showing the Speakora Finding Partner screen"),
          detail("speakora-onboarding", "b", "A phone on a desk showing the Speakora dashboard beside an earbuds case"),
        ],
        caption: "A calm, monochrome flow that keeps attention on the voice.",
      },
    ],
  },
];
