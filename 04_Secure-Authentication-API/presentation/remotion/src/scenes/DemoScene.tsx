import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

interface DemoStep {
  label: string;
  request: string;
  response: string;
}

const STEPS: DemoStep[] = [
  { label: "Registration", request: "POST /api/v1/auth/register", response: '201 {"email": "demo-user@example.com", "role": "user", ...}' },
  { label: "Valid Login", request: "POST /api/v1/auth/login", response: "200 {access_token} + Set-Cookie: refresh_token (HttpOnly)" },
  { label: "CORS Verified", request: "Origin: http://localhost:5173", response: "Allow-Origin echoed · Allow-Credentials: true" },
  { label: "Invalid Login", request: "POST /api/v1/auth/login (wrong password)", response: '401 {"code": "INVALID_CREDENTIALS"}' },
  { label: "Protected API", request: "GET /api/v1/users/me (Bearer token)", response: "200 {current user}" },
  { label: "No-Token Rejected", request: "GET /api/v1/users/me (no header)", response: "401 Unauthorized" },
  { label: "JWT Structure", request: "decode(access_token)", response: '{"sub", "type":"access", "jti", "iat", "exp", "role"} — HS256' },
  { label: "Refresh Rotation", request: "POST /api/v1/auth/refresh (cookie)", response: "200 {new access_token, rotated cookie}" },
  { label: "Authorization Flow (RBAC)", request: "GET /api/v1/admin/users (as regular user)", response: '403 {"code": "INSUFFICIENT_ROLE"}' },
  { label: "Logout", request: "POST /api/v1/auth/logout", response: "204 No Content" },
  { label: "Revocation Verified", request: "POST /api/v1/auth/refresh (revoked cookie)", response: '401 {"code": "INVALID_REFRESH_TOKEN"}' },
];

export function DemoScene({ totalFrames, chapter = "CH 07" }: { totalFrames: number; chapter?: string }) {
  const frame = useCurrentFrame();
  const framesPerStep = Math.floor(totalFrames / STEPS.length);
  const currentIndex = Math.min(Math.floor(frame / framesPerStep), STEPS.length - 1);
  const step = STEPS[currentIndex];
  const localFrame = frame - currentIndex * framesPerStep;
  const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em" }}>
          07 · END-TO-END DEMO
        </span>
        <span style={{ fontSize: 16, color: theme.colors.textMuted }}>
          Step {currentIndex + 1} / {STEPS.length}
        </span>
      </div>

      {/* progress track across the full width */}
      <div style={{ display: "flex", gap: 6, marginBottom: 44 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= currentIndex ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </div>

      <div style={{ opacity, flex: 1 }}>
        <h2 style={{ fontSize: 46, color: theme.colors.text, margin: "0 0 32px" }}>{step.label}</h2>
        <div
          style={{
            backgroundColor: theme.colors.panel,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 10,
            padding: 30,
            fontFamily: theme.font.mono,
            fontSize: 22,
          }}
        >
          <div style={{ color: theme.colors.textMuted }}>{step.request}</div>
          <div style={{ color: theme.colors.success, marginTop: 14 }}>→ {step.response}</div>
        </div>
      </div>

      <p style={{ fontSize: 16, color: theme.colors.textMuted }}>
        Real captured output from a live run against Docker + PostgreSQL — see presentation/demo-flow.md
      </p>
    </SlideFrame>
  );
}
