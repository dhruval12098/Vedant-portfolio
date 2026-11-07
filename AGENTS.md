# AGENTS.md: engineering rules for Vedant's portfolio

The rules for every change. Same philosophy as the Drimindesign site: fast first paint, motion as
progressive enhancement, no layout-triggering animation, and **Lighthouse performance 90–95**.

- **What** → [PRD.md](PRD.md) · **How it looks** → [DESIGN.md](DESIGN.md)

## 1. Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | CSS Modules wrapped in `@layer components`, tokens in `src/styles/tokens.css` |
| Motion | Plain CSS and small hooks (rAF, springs). Lenis for smooth scroll (added with section 2) |
| WebGL | three.js, **only** for the projects' fluid hover and the tissue transition, lazy-loaded |

Every new dependency needs its gzipped size and a reason in the PR.

```bash
npm run dev      # local dev on :3100
npm run build    # must pass with zero type and lint errors
npm run start    # production build (use this for Lighthouse)
```

## 2. Structure
```
src/
├─ app/            routing only: layout, pages, metadata
├─ features/
│  ├─ intro/       Hii hinge, flexible letters, word queue, Vedant, the line, pills
│  ├─ sentence/    scroll scene that composes the intro into one line
│  ├─ path/        the line becomes his education path
│  └─ projects/    stacked scroller, fluid hover, tissue transition
├─ components/     shared UI: navbar, hamburger, pill
├─ lib/motion/     tokens, springs, ticker, reduced-motion, intro gate
├─ content/        typed content: person, skills, education, projects
└─ styles/         tokens.css, globals.css
```
Import features through their `index.ts`. `app/` files stay thin.

## 3. Performance budget
| Budget | Limit |
|---|---|
| Initial JS (gzip) | ≤ 110 KB |
| three.js chunk | lazy, after load + idle, only near the projects |
| Fonts | ≤ 3 files above the fold |
| LCP | < 2.0 s (mobile, slow 4G) |
| CLS | < 0.05 |
| TBT | < 150 ms |

How the smoothness survives the budget:
1. **First paint is server HTML.** The intro's final text is in the HTML; animation enhances it.
2. **Compositor-only motion:** `transform`, `opacity`, `clip-path`. Never width, height, top or
   left. `will-change` only while a scene runs.
3. **One clock:** a single rAF ticker drives every JS animation; nothing runs when nothing moves.
4. **No React state per frame:** values go to refs and CSS variables.
5. **Measure once:** cache layout, re-measure on `ResizeObserver`, never read and write layout in
   the same frame.
6. **WebGL is scoped:** one canvas, centre project only, paused off-screen and when the tab is
   hidden; textures pre-sized and disposed.
7. **Pause what's hidden:** IntersectionObserver gates every scene.

## 4. Motion rules
- Every animation has a physical idea (DESIGN.md §5). If you can't name it, don't ship it.
- Values come from `lib/motion/tokens.ts`, never inline magic numbers.
- Three modes for every animated component: full, reduced (short fades), static (no JS).
- The intro plays on every full load of the home page (reloads included), never with reduced motion; client navigation never replays it (`lib/motion/intro-gate.ts`).
