# Management HTML Presentation — EP 01

A 10-chapter interactive HTML deck per `.claude/presentation/html-presentation-standard.md`,
mirroring the Remotion video's chapter structure (`presentation/storyboard.md`) in the
management-deck format — self-navigating slides, not a video file.

## Run it

No build step. From this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`. (A `file://` open also works for basic viewing,
but ES module imports in `js/presentation.js` require a real HTTP server in some browsers —
serving it is the reliable path.)

## Controls

- **Mouse**: Previous/Next buttons, click a progress dot to jump to that chapter
- **Keyboard**: `→`/`Space` next, `←` previous, `Home`/`End` first/last, `Escape` exits fullscreen
- **Touch**: swipe left/right
- Fullscreen toggle button in the nav bar

## Structure

Per `html-presentation-standard.md` §14 — modular CSS/JS, not inlined:

```
html/
├── index.html      # exactly 10 chapter sections (CH 01–CH 10)
├── css/            # variables, base, layout, components (incl. spread-grid utilities), slides, animations
├── js/             # presentation.js (entry), navigation.js, animations.js
└── assets/         # empty — no screenshots/diagrams captured for this build (see note below)
```

## Layout Principle

Content is distributed across the full 1920×1080 canvas using grid layouts (`.grid-2`,
`.grid-3`, `.stat-row`) — never centered into a single narrow column. Every content slide uses
the standard header (brand + project name) / content / footer (copyright + chapter tag) chrome
via consistent CSS classes, matching the Remotion video's `SlideFrame` component so both
formats read as one visual system.

## Verified

Every JS module syntax-checked (`node --check`); served locally and every CSS/JS
reference confirmed to resolve with zero 404s; exactly 10 `<section class="slide">` elements
with matching open/close tags.

## Known Gap

`assets/screenshots/` and `assets/diagrams/` are empty. No browser-screenshot capability was
available when this deck was built, so no real UI screenshots exist to place there — per the
standard's own "real assets only, never fabricated" rule (§16), an invented mockup was not
substituted. The deck instead shows real captured API/JSON output (Chapter 07) rather than a
fabricated screenshot.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
