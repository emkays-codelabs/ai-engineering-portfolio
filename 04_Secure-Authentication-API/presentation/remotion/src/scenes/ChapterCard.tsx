import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

interface ChapterCardProps {
  number: string; // "02".."10"
  title: string;
  window: string; // "03:00–07:00"
}

/** Consistent chapter divider — same treatment every time, no repeated full opening animation. */
export function ChapterCard({ number, title, window }: ChapterCardProps) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [8, 38], [0, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SlideFrame bare>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 120px",
        }}
      >
        <div style={{ opacity }}>
          <div style={{ fontSize: 22, color: theme.colors.primary, letterSpacing: "0.18em", fontWeight: 700 }}>
            CHAPTER {number}
          </div>
          <div style={{ width: lineWidth, height: 3, background: theme.colors.primary, margin: "22px 0" }} />
          <h1 style={{ fontSize: 68, color: theme.colors.text, margin: 0, maxWidth: 1400 }}>{title}</h1>
          <div style={{ fontSize: 19, color: theme.colors.textMuted, marginTop: 22, fontFamily: theme.font.mono }}>
            {window}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 120px 48px",
          fontSize: 14,
          color: theme.colors.textMuted,
          letterSpacing: "0.1em",
        }}
      >
        <span style={{ color: theme.colors.primary }}>SaffronyxAI.in</span>
        <span>SECURE AUTHENTICATION API · EP 01</span>
      </div>
    </SlideFrame>
  );
}
