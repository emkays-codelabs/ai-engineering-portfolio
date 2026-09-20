import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

export function DashboardScene({ chapter = "CH 08" }: { chapter?: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        08 · OBSERVABILITY
      </div>
      <h2 style={{ fontSize: 44, margin: "0 0 48px" }}>Real Readiness Check</h2>
      <div
        style={{
          opacity,
          backgroundColor: theme.colors.panel,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 10,
          padding: "28px 34px",
          fontFamily: theme.font.mono,
          fontSize: 26,
          alignSelf: "flex-start",
        }}
      >
        <span style={{ color: theme.colors.textMuted }}>GET /health → </span>
        <span style={{ color: theme.colors.success }}>200 {"{"}"status": "ok"{"}"}</span>
      </div>
      <div style={{ flex: 1 }} />
      <p style={{ fontSize: 20, color: theme.colors.textMuted, maxWidth: 1200, lineHeight: 1.5 }}>
        Readiness check verifies a real DB query — not just process liveness. A full metrics
        dashboard was <strong style={{ color: theme.colors.gold }}>NOT</strong> built for this
        project — disclosed limitation, not hidden.
      </p>
    </SlideFrame>
  );
}
