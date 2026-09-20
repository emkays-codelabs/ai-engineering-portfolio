# YouTube Series Manifest — Secure Authentication API

Single source of truth for episode numbering. All scripts, storyboards, Remotion compositions,
thumbnails, descriptions, and publication metadata derive their episode number/title from this
file — never independently invented per asset.

This project produces **one** video, not a multi-part series — `task.md` requires a single
YouTube demo. The manifest below has one entry; it exists so that if a future episode is ever
added, numbering has a real starting point to extend from rather than being invented ad hoc,
and so this episode's own metadata stays consistent across every asset that references it.

## Series

- **Project**: Secure Authentication API
- **Series title**: Secure Authentication API — Technical Walkthrough
- **Brand**: SaffronyxAI.in · "Designing Intelligent Systems That Last"

## Episodes

| Field | Value |
|---|---|
| Episode number | EP 01 |
| Stable episode ID | `ep01-secure-authentication-api` |
| Title | Secure Authentication API — Full Technical Walkthrough |
| Purpose | Complete project walkthrough: problem, requirements, architecture, LLD, implementation, testing/security, live demo, deployment, results, conclusion |
| Sequence | 1 of 1 (no further episodes planned) |
| Dependencies | None |
| Production status | Rendered and verified — `ffprobe`: duration=2400.000000s (40:00 exactly), codec=h264, 1920x1080, nb_frames=72000, r_frame_rate=30/1 |
| Video asset | `presentation/remotion/out/Saffronyx_Secure-Authentication-API_EP01_Full-Technical-Walkthrough.mp4` (gitignored — regenerate via `npm run render`) |
| Thumbnail asset | Not yet created — see Known Gaps below |
| Publication status | Not published (awaiting `H2`/`H3` — user-performed recording/submission steps) |
| Publication URL | N/A |

## Continuity Notes

- Episode 01 uses the full branded opening (10s Saffronyx open, per `presentation/storyboard.md`
  Chapter 1) since it is both the first and only episode.
- Closing (Chapter 10 / `CreditsScene`) is framed as a project retrospective and series close —
  it does **not** promise a "next episode," since none is planned. This is intentional per the
  continuity rule ("avoid promising a next episode that has not been approved or planned"), not
  an oversight.
- If a second episode is ever added (e.g. a deep-dive on one subsystem), it becomes EP 02 in
  this same table — EP 01's number and stable ID are never changed once this episode is
  published, even if the plan around it changes.

## Known Gaps

- **Thumbnail**: not yet designed — no thumbnail-generation step has run for this project.
  Disclosed here rather than fabricated.
- **Video asset path**: reflects the intended output of `npm run render` (see
  `presentation/remotion/README.md`); the file itself is gitignored and regenerated locally,
  not committed.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
