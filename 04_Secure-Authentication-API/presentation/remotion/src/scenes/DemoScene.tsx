import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

interface DemoStep {
  label: string;
  request: string;
  response: string;
  pass: boolean;
}

const STEPS: DemoStep[] = [
  { label: "Register", request: "POST /api/v1/auth/register", response: '201 {"email": "demo-user@example.com", "role": "user", ...}', pass: true },
  { label: "Valid Login", request: "POST /api/v1/auth/login", response: "200 {access_token} + Set-Cookie: refresh_token (HttpOnly)", pass: true },
  { label: "Invalid Login", request: "POST /api/v1/auth/login (wrong password)", response: '401 {"code": "INVALID_CREDENTIALS"}', pass: true },
  { label: "Protected API", request: "GET /api/v1/users/me (Bearer token)", response: "200 {current user}", pass: true },
  { label: "Refresh", request: "POST /api/v1/auth/refresh (cookie)", response: "200 {new access_token, rotated cookie}", pass: true },
  { label: "Authorization Flow", request: "GET /api/v1/admin/users (as regular user)", response: '403 {"code": "INSUFFICIENT_ROLE"}', pass: true },
  { label: "Logout", request: "POST /api/v1/auth/logout", response: "204 No Content", pass: true },
  { label: "Revocation Verified", request: "POST /api/v1/auth/refresh (revoked cookie)", response: '401 {"code": "INVALID_REFRESH_TOKEN"}', pass: true },
];

const FRAMES_PER_STEP = Math.floor(2700 / STEPS.length);

export function DemoScene() {
  const frame = useCurrentFrame();
  const currentIndex = Math.min(Math.floor(frame / FRAMES_PER_STEP), STEPS.length - 1);
  const step = STEPS[currentIndex];
  const localFrame = frame - currentIndex * FRAMES_PER_STEP;
  const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={container}>
      <h2 style={{ fontSize: 36, marginBottom: 10, color: theme.colors.textMuted }}>
        Live Demo — {currentIndex + 1}/{STEPS.length}
      </h2>
      <div style={{ opacity, textAlign: "center", maxWidth: 900 }}>
        <h3 style={{ fontSize: 40, color: theme.colors.primary, marginBottom: 20 }}>{step.label}</h3>
        <div
          style={{
            backgroundColor: theme.colors.panel,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 10,
            padding: 24,
            fontFamily: theme.font.mono,
            fontSize: 20,
            textAlign: "left",
          }}
        >
          <div style={{ color: theme.colors.textMuted }}>{step.request}</div>
          <div style={{ color: step.pass ? theme.colors.success : theme.colors.danger, marginTop: 10 }}>
            → {step.response}
          </div>
        </div>
      </div>
      <p style={{ marginTop: 40, fontSize: 16, color: theme.colors.textMuted }}>
        Real captured output from a live run against Docker + PostgreSQL — see demo-flow.md
      </p>
    </div>
  );
}
