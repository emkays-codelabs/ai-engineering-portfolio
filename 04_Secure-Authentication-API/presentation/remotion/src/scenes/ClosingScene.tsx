import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

export function ClosingScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={container}>
      <div style={{ opacity, textAlign: "center" }}>
        <h1 style={{ fontSize: 52, color: theme.colors.text, marginBottom: 20 }}>
          Secure Authentication API
        </h1>
        <p style={{ fontSize: 24, color: theme.colors.success }}>101/101 tests passing · verified live</p>
        <p style={{ fontSize: 20, color: theme.colors.textMuted, marginTop: 30 }}>
          Full source, docs, and ADRs in the repository README
        </p>
      </div>
    </div>
  );
}
