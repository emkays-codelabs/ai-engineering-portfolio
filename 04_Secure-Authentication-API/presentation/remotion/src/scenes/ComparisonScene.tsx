import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

export function ComparisonScene() {
  const frame = useCurrentFrame();
  const leftOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const rightOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={container}>
      <h2 style={{ fontSize: 40, marginBottom: 40 }}>A Real Bug, Found and Fixed by TDD</h2>
      <div style={{ display: "flex", gap: 40 }}>
        <div
          style={{
            opacity: leftOpacity,
            backgroundColor: theme.colors.panel,
            border: `2px solid ${theme.colors.danger}`,
            borderRadius: 12,
            padding: 24,
            width: 380,
          }}
        >
          <h3 style={{ color: theme.colors.danger, marginTop: 0 }}>Before</h3>
          <p style={{ fontSize: 18 }}>
            passlib 1.7.4 + bcrypt 5.0 → <code>ValueError: password cannot be longer than 72
            bytes</code> during passlib's own internal self-test
          </p>
        </div>
        <div
          style={{
            opacity: rightOpacity,
            backgroundColor: theme.colors.panel,
            border: `2px solid ${theme.colors.success}`,
            borderRadius: 12,
            padding: 24,
            width: 380,
          }}
        >
          <h3 style={{ color: theme.colors.success, marginTop: 0 }}>After</h3>
          <p style={{ fontSize: 18 }}>
            Pinned <code>bcrypt&lt;4.1</code> (documented, known-compatible line) — task.md
            required passlib specifically, so it wasn't dropped
          </p>
        </div>
      </div>
      <p
        style={{
          marginTop: 40,
          fontSize: 20,
          color: theme.colors.textMuted,
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Caught in seconds because the test ran immediately after the code — not at the end
      </p>
    </div>
  );
}
