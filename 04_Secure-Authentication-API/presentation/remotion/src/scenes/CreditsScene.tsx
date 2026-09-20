import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

export function CreditsScene() {
  const frame = useCurrentFrame();
  const recapOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const creditsOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brandOpacity = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SlideFrame bare>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 120px" }}>
        <div style={{ opacity: recapOpacity }}>
          <div style={{ fontSize: 20, color: theme.colors.primary, letterSpacing: "0.18em", fontWeight: 700 }}>
            CHAPTER 10 · CONCLUSION
          </div>
          <h2 style={{ fontSize: 56, margin: "24px 0 20px", color: theme.colors.text }}>Recap</h2>
          <p style={{ fontSize: 24, color: theme.colors.textMuted, maxWidth: 1350, lineHeight: 1.45 }}>
            A JWT authentication service implementing refresh-token rotation with reuse-rejection,
            server-side-only RBAC, and a documented token-transport decision — 101/101 tests
            passing, verified live against Docker + PostgreSQL.
          </p>
        </div>

        <div
          style={{
            opacity: creditsOpacity,
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
              CONTRIBUTION &amp; OWNERSHIP
            </div>
            <p style={{ fontSize: 18, color: theme.colors.textMuted, lineHeight: 1.5, margin: 0 }}>
              Directed and reviewed AI-paired development (Claude Code). Architecture, technology
              decisions, and verification performed by the author; implementation generated under
              direct human review — see docs/portfolio/case-study.md.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 14, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
              THIRD-PARTY COMPONENTS
            </div>
            <p style={{ fontSize: 18, color: theme.colors.textMuted, lineHeight: 1.5, margin: 0 }}>
              FastAPI, SQLAlchemy, Alembic, PyJWT, passlib/bcrypt, React, Vite, React Router,
              PostgreSQL, Docker, Remotion — each under its own license.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: brandOpacity,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "0 120px 56px",
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: 32,
          margin: "0 120px",
        }}
      >
        <div>
          <div style={{ color: theme.colors.primary, fontSize: 22, letterSpacing: "0.16em", fontWeight: 700 }}>
            SAFFRONYXAI.IN
          </div>
          <div style={{ color: theme.colors.cream, fontSize: 17, fontStyle: "italic", marginTop: 8 }}>
            Designing Intelligent Systems That Last
          </div>
        </div>
        <div style={{ textAlign: "right", color: theme.colors.textMuted, fontSize: 16 }}>
          <div style={{ color: theme.colors.text }}>Mahesh Kumar</div>
          <div>Founder &amp; CEO, SaffronyxAI.in</div>
          <div style={{ marginTop: 8, fontSize: 14 }}>© 2026 SaffronyxAI.in · All Rights Reserved</div>
        </div>
      </div>
    </SlideFrame>
  );
}
