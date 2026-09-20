import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

const REQUIREMENTS = [
  { id: "FR1", text: "User registration (email + password)" },
  { id: "FR2", text: "Password hashing (bcrypt via passlib)" },
  { id: "FR3", text: "Login via OAuth2 Password Flow" },
  { id: "FR4", text: "JWT access tokens, full claim validation" },
  { id: "FR5", text: "Refresh tokens — rotation + reuse rejection" },
  { id: "FR6", text: "Protected routes (get_current_user)" },
  { id: "FR7", text: "Admin/User RBAC, server-side enforced" },
  { id: "FR8", text: "Logout via token blacklist (bonus)" },
  { id: "FR9", text: "React login/register UI" },
  { id: "FR10", text: "Dockerized deployment" },
];

export function RequirementsScene({ chapter = "CH 02" }: { chapter?: string }) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        02 · BUSINESS REQUIREMENTS
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 36 }}>
        <h2 style={{ fontSize: 42, margin: 0 }}>Functional Requirements</h2>
        <span style={{ fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.font.mono }}>
          docs/PRD.md §5
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 48px" }}>
        {REQUIREMENTS.map((req, i) => {
          const start = i * 9;
          const opacity = interpolate(frame, [start, start + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={req.id}
              style={{
                opacity,
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 21,
                borderBottom: `1px solid ${theme.colors.border}`,
                paddingBottom: 12,
              }}
            >
              <span style={{ color: theme.colors.primary, fontWeight: 700, width: 54, flexShrink: 0 }}>
                {req.id}
              </span>
              <span style={{ flex: 1, color: theme.colors.text }}>{req.text}</span>
              <span style={{ fontSize: 12, color: theme.colors.success, letterSpacing: "0.06em", flexShrink: 0 }}>
                IMPLEMENTED
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <p style={{ fontSize: 18, color: theme.colors.textMuted }}>
        Every requirement traces to a verified task — none marked done by assertion alone.
      </p>
    </SlideFrame>
  );
}
