import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

/** Chapter 1's branded opening — the full Saffronyx open (first 10s), used once. */
export function TitleScene({ title, hook }: { title: string; hook: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brandProgress = spring({ frame, fps, config: { damping: 16 } });
  const rule = interpolate(frame, [12, 45], [0, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const metaOpacity = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SlideFrame bare>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 120px" }}>
        <div
          style={{
            opacity: brandProgress,
            transform: `translateY(${(1 - brandProgress) * 16}px)`,
            fontSize: 24,
            letterSpacing: "0.22em",
            color: theme.colors.primary,
            fontWeight: 700,
          }}
        >
          SAFFRONYXAI.IN
        </div>
        <div style={{ width: rule, height: 4, background: theme.colors.primary, margin: "28px 0" }} />
        <h1 style={{ fontSize: 92, margin: 0, color: theme.colors.text, opacity: titleOpacity, maxWidth: 1500 }}>
          {title}
        </h1>
        <p style={{ fontSize: 26, color: theme.colors.cream, marginTop: 24, opacity: titleOpacity, fontStyle: "italic" }}>
          {hook}
        </p>
      </div>
      <div
        style={{
          opacity: metaOpacity,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "0 120px 56px",
          fontSize: 16,
          color: theme.colors.textMuted,
        }}
      >
        <div>
          <div style={{ letterSpacing: "0.12em", marginBottom: 6 }}>TECHNICAL PRESENTATION · EP 01</div>
          <div>Version 1.0 · 2026-09-20</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: theme.colors.text }}>Mahesh Kumar</div>
          <div>Founder &amp; CEO, SaffronyxAI.in</div>
        </div>
      </div>
    </SlideFrame>
  );
}
