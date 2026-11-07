# Vedant: portfolio, product requirements

A personal portfolio for **Vedant**, Java developer with QA and testing skills, built by Drimindesign
in the same motion language as the agency's own site: every animation tells part of his story.

- **How it looks** → [DESIGN.md](DESIGN.md)
- **How we build it** → [AGENTS.md](AGENTS.md)

## Goals
1. Introduce Vedant as a person, not a CV: a greeting, his name, what he knows, where he learned
   it, and what he has built.
2. One continuous story: each section grows out of the one before (the line under his name becomes
   his education path, which leads into his projects).
3. Feel as smooth as the Drimindesign site on phones and desktops, at **Lighthouse performance
   90–95** (accessibility, best practices and SEO 100).

## Pages
| Page | Contents |
|---|---|
| **Home** | Intro → sentence → education path → projects → (closing section, to be decided) |
| **Projects** | All projects, the same stacked scroller, full page |
| **Project detail** | One project: hero image (lands from the tissue transition), role, story, images |
| **About** | Longer story, skills, education, contact |

Navigation bar and mobile hamburger: the same look and animations as the Drimindesign site.

## Home, section by section

### 1. The intro (plays on every load of the home page; see PLAN.md for the full beat sheet)
1. **"Hi"** appears.
2. A second **"i"** swings down from a hinge at the height of its dot (like a top-hung window
   closing), making **"Hii"**. It starts edge-on, rotates down to flat, and settles with a small
   overshoot.
3. The letters turn **flexible**: they bend and stretch around the pointer (or a finger), exactly
   like the DRIMIN wordmark. Held 1–2 s.
4. **"Myself"** slides in from the left and pushes "Hii" out to the right, like a queue.
5. **"Vedant"** slides in the same way and pushes "Myself" out.
6. A thin **line** draws in under "Vedant".
7. **Skill pills** (fully rounded capsules) pop in at scattered positions and drift gently:
   Java, C++, Python, HTML, CSS, JavaScript, plus QA / Testing.

**When it plays:** on a new tab or window, or after the browser is closed and reopened. Not again
when moving between pages in the same tab (session storage). `?intro` forces it for review.
Reduced motion: the final composed state, with a short fade.

### 2. The sentence (scroll)
Scrolling down reassembles the intro into one composed line, driven by scroll (and reversible):
- "Hi, myself" becomes a small eyebrow above "Vedant";
- "Vedant" stays as the heading, with the line under it;
- the scattered pills fly in and line up in a row under the line;
- a role line appears: *Java developer · QA & testing*.

### 3. The education path: "the line becomes his path"
The line under his name continues: it turns and draws downward as the visitor scrolls, becoming the
timeline of his education, oldest first:
1. **St. Dan's English Medium School**: 10th
2. **Malojiraje**: 11th–12th
3. **Jaysingpur College**: degree (name, degree and years to be confirmed)

At each stop a dot lands on the line, the school's name swings in on the same top hinge as the
"i", and the year counts up. Skill pills detach from the row and fly to the stop where he learned
them. At the end the pills gather under *Java developer · QA & testing*, and the line runs on into
the projects.

**Hover:** the line has the same **fluid effect** as the project images: it ripples and bends
around the pointer like liquid, so the motion language stays continuous.

### 4. Projects
- **Stacked vertical scroller:** the project in the centre is large and in focus; the ones above
  and below sit behind, smaller and dimmer. Scrolling carries each one through the centre.
- **Full-width layout:** title and a short description on the **left**, the image stack on the
  **right**.
- **Hover on the centre image:** a fluid light effect (the image ripples under the cursor, light
  moving across it). WebGL, centre card only.
- **Click:** the **tissue-snatch transition** from the Drimindesign site opens the project page.

Projects (he worked on all three with Drimindesign):
1. **House of Diams**
2. **Shreeram Milks**
3. **The Speaker app**

### 5. Closing section
To be decided.

## Content
| Item | Value |
|---|---|
| Name | Vedant |
| Role | Java developer · QA & testing |
| Skills | Java, C++, Python, HTML, CSS, JavaScript, QA / Testing |
| Education | St. Dan's English Medium School (10th) → Malojiraje (11th–12th) → Jaysingpur College (degree) |
| Projects | House of Diams, Shreeram Milks, the Speaker app |

**To confirm:** exact school and college names, degree, years, and which skills were learned where.

## Non-goals (for now)
CMS, blog, dark theme, contact form back end.

## Success criteria
- Lighthouse mobile: performance 90–95, accessibility / best practices / SEO 100.
- 60 fps on a mid-range phone through the intro, the sentence, the path and the projects.
- Every animation reversible on scroll-up, and every piece of content readable without JavaScript.
