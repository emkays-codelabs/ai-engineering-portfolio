import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

interface ProblemSceneProps {
  heading: string;
  points: string[];
}

export function ProblemScene({ heading, points }: ProblemSceneProps) {
  const frame = useCurrentFrame();

  return (
    <div style={container}>
      <h2 style={{ fontSize: 48, color: theme.colors.text, marginBottom: 40 }}>{heading}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
        {points.map((point, i) => {
          const start = 15 + i * 15;
          const opacity = interpolate(frame, [start, start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + 15], [-30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={point}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                fontSize: 28,
                color: theme.colors.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ color: theme.colors.danger, fontSize: 32 }}>?</span>
              {point}
            </div>
          );
        })}
      </div>
    </div>
  );
}
