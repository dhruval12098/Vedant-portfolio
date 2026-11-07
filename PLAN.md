# Build plan — Vedant portfolio

> **Redesign (2026-11-07):** the site is now an all-white "terminal" theme in Monoid: a boot loader
> (INITIALIZING… → BUILD SUCCESSFUL), a statement over an ASCII coffee cup with X/Y readout, an
> expertise marquee (one line per project, hover card, opens the project), the education path in
> terminal boxes that decode as the line reaches them, and the projects strip in the osply.co layout
> (WebGL cloth bend, tissue pull into detailed case-study pages). The hero sections below describe
> the earlier dark version and are kept for history.

The spec is the conversation with the owner, captured here section by section. Each section is
built to the full spec, then verified in the browser (frames paused at key moments, console
clean, desktop + phone) before the next one starts. No placeholders unless listed under "Open".

One motion language throughout: **letters on a hinge**, **a line drawn by powder**, **soft physical
bodies** (springs, gravity, friction), **fluid light** under the pointer.

---

## 1. Hero (dark Persian indigo panel, white type)

| Beat | What happens | How |
|---|---|---|
| Frame | The dark panel pops (0.9 → 1) and expands out of a white frame, as on the Drimindesign site | CSS `scale` + `transform`, pre-paint script writes frame geometry |
| Hi → Hii | "Hi" swings down letter by letter from a hinge at the top of the ink; the second "i" follows on its own | CSS per-letter `rotateX` keyframes, staggered by `--li` |
| Three levels | Hii's letters tip away; Myself's swing down from the top; then Myself → Vedant. A word has gone before the next is visible | same keyframes, `--in` / `--out` per word |
| Grow | Vedant scales up from queue size to full, and stays | `scale` animation |
| Powder | A powder tip comes out of the foot of Vedant's last letter ("t") and draws the line under the name, from right to left, shedding faint motes that drift up (the Drimindesign tree's growing tip) | 2D canvas overlay; tip follows the line's drawn end each frame; runs only while motes live |
| Pills | Skills (Java, Python, HTML, CSS, JavaScript) pop in at random tilted spots, sized by strength, in the navbar's liquid-glass look | CSS pop; glass from the Drimindesign `liquid-glass` recipe |
| Drag | Every pill can be grabbed and thrown, anywhere, any time | matter-js bodies, a spring constraint to the pointer; DOM pills follow the bodies by `transform` |
| Scroll | The sentence composes (eyebrow "Hi, myself", name, line, role, equal gaps) and gravity switches on: the pills fall and land on the floor of the hero at random places, tumbling, settling. Back up: gravity off, they float home | `--t` from scroll; physics gravity follows `t` |
| Flex letters | The name's letters bend around the pointer and never overlap | existing bend + no-overlap constraint |
| Intro replay | Every full load of the home page; never with reduced motion | inline gate script |

## 2. Path (white)

| Beat | What happens | How |
|---|---|---|
| Drag-out | The line is pulled out of the end of the title's last letter, curves down to the centre and runs down the page | one SVG path: curve + vertical run |
| Draw | Scrolling draws the line; the powder tip rides its end, shedding motes | `stroke-dashoffset` from scroll; tip = `getPointAtLength` |
| Stops | As the tip reaches a stop, the dot fills and the stop's name lights up letter by letter (each letter swings down on the hinge, muted → ink); scrolling back un-lights it | `data-lit` per stop, per-letter CSS transitions staggered by index |
| Fluid line | Pointer near the line pulls it like a string; it springs back, wobbling | spring-damped offsets on the line's points, path rebuilt only while moving |
| Stops | St. Dan's English Medium School (10th) → Malojiraje (11th–12th) → Jaysingpur College (degree) → Now: Java developer · QA & testing | `content/path.ts` |

## 3. Projects (darker: near-black)

| Beat | What happens | How |
|---|---|---|
| Layout | Full width. Left: the active project's number, kind, name, summary. Right: a vertical stack of image cards; the centre card is large and lit, the previous one tucked behind above it, the next one behind below | sticky stage, scroll → `--p`, cards placed in 3D from their distance to the centre |
| Images | Real photography (Unsplash) per project until Vedant's screenshots arrive | `next/image`, remote pattern for images.unsplash.com |
| Fluid hover | On the centre card, the pointer stirs the image like liquid and a soft light follows it | three.js plane over the card, displacement + highlight shader fed by a short pointer trail; only renders while the pointer is moving or the ripple decays; lazy-loaded |
| Open | Clicking the centre card lifts it like a tissue: the top-right corner pinches up, the sheet is drawn out to fill the screen, the project page lands beneath | the Drimindesign tissue transition, ported |
| Project page | `/projects/[slug]`: hero image in the exact final rect, name, summary, back link (back plays the pull in reverse) | static params for every project |

## 4. Footer (white)

The name once more, big; the line comes to rest under it; role, section links, copyright.

---

## Verification per section

1. `tsc` + `eslint` clean.
2. Frames paused at each beat (Web Animations `currentTime` for CSS; scripted pointer/scroll for JS).
3. Console clean; nothing running off-screen (rAF stops).
4. Desktop and 375 px phone; reduced motion shows the final state.

## Open (owner to confirm)

- School names, degree and years; real project summaries and screenshots; contact links.
