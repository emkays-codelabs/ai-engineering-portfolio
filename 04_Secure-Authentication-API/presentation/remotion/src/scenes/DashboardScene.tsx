import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

export function DashboardScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={container}>
      <h2 style={{ fontSize: 40, marginBottom: 30 }}>Observability — Real Response</h2>
      <div
        style={{
          opacity,
          backgroundColor: theme.colors.panel,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 10,
          padding: "20px 30px",
          fontFamily: theme.font.mono,
          fontSize: 22,
        }}
      >
        <span style={{ color: theme.colors.textMuted }}>GET /health → </span>
        <span style={{ color: theme.colors.success }}>200 {"{"}"status": "ok"{"}"}</span>
      </div>
      <p style={{ marginTop: 30, fontSize: 18, color: theme.colors.textMuted, maxWidth: 700, textAlign: "center" }}>
        Readiness check verifies a real DB query — not just process liveness. A full metrics
        dashboard was NOT built for this project (disclosed limitation, not hidden).
      </p>
    </div>
  );
}
