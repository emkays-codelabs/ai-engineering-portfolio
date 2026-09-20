import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

interface Metric {
  label: string;
  value: number;
  suffix?: string;
}

interface MetricSceneProps {
  heading: string;
  metrics: Metric[];
  note?: string;
  chapter?: string;
  eyebrow?: string;
}

export function MetricScene({ heading, metrics, note, chapter = "CH 06", eyebrow = "TESTING & QUALITY" }: MetricSceneProps) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 44, margin: "0 0 60px" }}>{heading}</h2>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        {metrics.map((metric, i) => {
          const start = i * 10;
          const progress = interpolate(frame, [start, start + 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const displayed = Math.round(metric.value * progress);
          return (
            <div
              key={metric.label}
              style={{
                flex: 1,
                borderLeft: `3px solid ${theme.colors.primary}`,
                paddingLeft: 28,
                marginRight: 32,
              }}
            >
              <div style={{ fontSize: 88, color: theme.colors.primary, fontWeight: 700, lineHeight: 1 }}>
                {displayed}
                {metric.suffix ?? ""}
              </div>
              <div style={{ fontSize: 20, color: theme.colors.textMuted, marginTop: 14 }}>{metric.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      {note && (
        <p
          style={{
            fontSize: 20,
            color: theme.colors.gold,
            opacity: interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {note}
        </p>
      )}
    </SlideFrame>
  );
}
