import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

export function ComparisonScene({ chapter = "CH 09" }: { chapter?: string }) {
  const frame = useCurrentFrame();
  const leftOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const rightOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        09 · CHALLENGES &amp; TRADE-OFFS
      </div>
      <h2 style={{ fontSize: 42, margin: "0 0 44px" }}>A Real Bug, Found by TDD</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div
          style={{
            opacity: leftOpacity,
            backgroundColor: theme.colors.panel,
            borderLeft: `4px solid ${theme.colors.danger}`,
            borderRadius: 10,
            padding: 28,
          }}
        >
          <h3 style={{ color: theme.colors.danger, marginTop: 0, fontSize: 22 }}>BEFORE</h3>
          <p style={{ fontSize: 20, lineHeight: 1.5, color: theme.colors.text }}>
            passlib 1.7.4 + bcrypt 5.0 →{" "}
            <span style={{ fontFamily: theme.font.mono, fontSize: 18 }}>
              ValueError: password cannot be longer than 72 bytes
            </span>{" "}
            during passlib&apos;s own internal self-test
          </p>
        </div>
        <div
          style={{
            opacity: rightOpacity,
            backgroundColor: theme.colors.panel,
            borderLeft: `4px solid ${theme.colors.success}`,
            borderRadius: 10,
            padding: 28,
          }}
        >
          <h3 style={{ color: theme.colors.success, marginTop: 0, fontSize: 22 }}>AFTER</h3>
          <p style={{ fontSize: 20, lineHeight: 1.5, color: theme.colors.text }}>
            Pinned <span style={{ fontFamily: theme.font.mono, fontSize: 18 }}>bcrypt&lt;4.1</span> —
            task.md required passlib specifically, so it wasn&apos;t dropped
          </p>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <p
        style={{
          fontSize: 20,
          color: theme.colors.gold,
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Caught in seconds because the test ran immediately after the code — not at the end.
      </p>
    </SlideFrame>
  );
}
