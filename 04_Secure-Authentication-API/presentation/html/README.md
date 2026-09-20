# Management HTML Presentation

A 15-slide interactive HTML deck per `.claude/presentation/html-presentation-standard.md`.
Content mirrors `presentation/storyboard.md` (the Remotion video) but in the management-deck
format — self-navigating slides, not a video file.

## Run it

No build step. From this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`. (A `file://` open also works for basic viewing,
but ES module imports in `js/presentation.js` require a real HTTP server in some browsers —
serving it is the reliable path.)

## Controls

- **Mouse**: Previous/Next buttons, click a progress dot to jump to that slide
- **Keyboard**: `→`/`Space` next, `←` previous, `Home`/`End` first/last, `Escape` exits fullscreen
- **Touch**: swipe left/right
- Fullscreen toggle button in the nav bar

## Structure

Per `html-presentation-standard.md` Section 14 — modular CSS/JS, not inlined:

```
html/
├── index.html
├── css/            # variables, base, layout, components, slides, animations
├── js/             # presentation.js (entry), navigation.js, animations.js
└── assets/         # empty — no screenshots/diagrams captured for this build (see note below)
```

## Known Gap

`assets/screenshots/` and `assets/diagrams/` are empty. No browser-screenshot capability was
available when this deck was built, so no real UI screenshots exist to place there — per the
standard's own "real assets only, never fabricated" rule (Section 16), an invented mockup was
not substituted. The deck instead shows real captured API/JSON output (Slide 10) rather than a
fabricated screenshot.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
