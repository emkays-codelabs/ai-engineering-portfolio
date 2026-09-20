import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

interface ProblemSceneProps {
  heading: string;
  points: string[];
  chapter?: string;
  eyebrow?: string;
}

export function ProblemScene({ heading, points, chapter = "CH 01", eyebrow = "01 · BUSINESS PROBLEM" }: ProblemSceneProps) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 48, color: theme.colors.text, margin: "0 0 48px" }}>{heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, flex: 1, alignContent: "start" }}>
        {points.map((point, i) => {
          const start = 15 + i * 15;
          const opacity = interpolate(frame, [start, start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [start, start + 15], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={point}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                background: theme.colors.panel,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div style={{ color: theme.colors.primary, fontSize: 40, marginBottom: 16 }}>?</div>
              <div style={{ fontSize: 22, color: theme.colors.text, lineHeight: 1.4 }}>{point}</div>
            </div>
          );
        })}
      </div>
    </SlideFrame>
  );
}
