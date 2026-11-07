# Vedant: design system

White, typographic, calm, with motion that feels physical. The same family as the Drimindesign
site: big flexible display letters, rounded pills, one strong accent, and every animation built on
a real-world idea (a window hinge, a queue, a path being drawn, liquid).

## 1. Colour
| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page |
| `--bg-soft` | `#f4f4f2` | Pills, cards at rest |
| `--ink` | `#0d0d0f` | Display type, body text, the line |
| `--ink-muted` | `#5c5c63` | Descriptions, eyebrow |
| `--line` | `#0d0d0f` | The line / path |
| `--accent` | `#4c1d95` | Drimindesign purple: hover, focus, the active stop on the path |
| `--accent-soft` | `#ede7f8` | Hovered pill |
| `--focus` | `#4c1d95` | Focus ring, 2px, 2px offset |

Contrast: ink on white 19:1; muted ink on white 6.4:1 (AA for body).

## 2. Type
| Role | Font | Size (fluid) | Line height |
|---|---|---|---|
| Display ("Hii", "Myself", "Vedant") | Outrun (from Drimindesign) | `clamp(6rem, 22vw, 22rem)` | 0.86 |
| Heading | Manrope 600 | `clamp(2rem, 4vw, 3.5rem)` | 1.05 |
| Eyebrow ("Hi, myself") | Manrope 600, uppercase, 0.12em tracking | `clamp(0.8rem, 1.2vw, 1rem)` | 1.2 |
| Body | Manrope 400 | `clamp(1rem, 1.1vw, 1.125rem)` | 1.55 |
| Pill | Manrope 500 | `0.95rem` | 1 |

Fonts: `next/font/local`, WOFF2, Latin subset, `display: swap`, fallback metrics adjusted.

## 3. Space and layout
- 4px base; tokens `--s-1` … `--s-12` (4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 192).
- Gutter `clamp(1rem, 4vw, 3rem)`; content max width 90rem.
- Breakpoints: 360 (base), 640, 768, 1024, 1440, 1920.
- Full-height sections use `svh`.

## 4. Components
- **Pill:** fully rounded (`border-radius: 999px`), `--bg-soft`, 1px `--ink` at 12% border,
  padding 0.6em 1.1em, at least 44px tall when interactive. Hover: `--accent-soft`, lifts 2px.
- **The line:** 2px `--line`, round caps. Drawn by `stroke-dashoffset` (path) or `scaleX/scaleY`
  (straight runs). On hover it ripples (see §5.5).
- **Path stop:** 14px dot on the line; active stop fills `--accent` with a soft ring.
- **Navbar and hamburger:** the Drimindesign site's components and motion, in the white theme.

## 5. Motion
All values live in `src/lib/motion/tokens.ts`. Only `transform`, `opacity`, `clip-path` animate.

### 5.1 Easing and duration
| Token | Value |
|---|---|
| `ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)` (expo out) |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `ease.hinge` | `cubic-bezier(0.34, 1.4, 0.64, 1)` (settle with overshoot) |
| `dur.fast` / `base` / `slow` | 180 / 420 / 900 ms |

### 5.2 The hinge ("i" swinging in)
`perspective: 900px` on the word; the letter's `transform-origin` sits at the top of its dot;
`rotateX(-90deg)` → `rotateX(0)` over 900 ms with `ease.hinge`, opacity 0.01 → 1 in the first
third. Physical idea: a top-hung window closing under its own weight.

### 5.3 Flexible letters
Ported from the DRIMIN wordmark: each letter a rubber stalk anchored at its baseline, 12 strips,
lean toward the pointer, whip from pointer speed, spring stiffness 170 / damping 18.

### 5.4 The queue
The incoming word enters from the left; when its leading edge meets the current word, it pushes:
the current word is shoved right with the same speed and leaves the screen, with a slight lean
(skew −4° → 0) like a body being nudged. 700 ms per hand-off, `ease.out`.

### 5.5 Fluid hover (line and project images)
One idea everywhere: a surface that ripples like liquid under the pointer.
- **The line:** an SVG path whose points are pushed by a damped spring field around the pointer
  (a few dozen points, rAF only while it moves).
- **Project images:** a WebGL shader on the centre card (displacement from a decaying ripple
  texture, light streak following the pointer).

### 5.6 Scroll-driven scenes
The sentence, the path and the project stack map scroll progress to animation progress through
Lenis plus a single ticker; each scene is reversible.

## 6. Accessibility
- One `<h1>` ("Vedant"); the intro letters are `aria-hidden` with the full sentence in an
  `sr-only` element.
- Reduced motion: no hinge, queue or ripples; final layouts with 200 ms fades.
- Every hover effect has a touch equivalent; touch targets are 44px or more.
