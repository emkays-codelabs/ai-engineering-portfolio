import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

interface Metric {
  label: string;
  value: number;
  suffix?: string;
}

export function MetricScene({ heading, metrics, note }: { heading: string; metrics: Metric[]; note?: string }) {
  const frame = useCurrentFrame();

  return (
    <div style={container}>
      <h2 style={{ fontSize: 44, marginBottom: 50 }}>{heading}</h2>
      <div style={{ display: "flex", gap: 60 }}>
        {metrics.map((metric, i) => {
          const start = i * 10;
          const progress = interpolate(frame, [start, start + 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const displayed = Math.round(metric.value * progress);
          return (
            <div key={metric.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64, color: theme.colors.success, fontWeight: 700 }}>
                {displayed}
                {metric.suffix ?? ""}
              </div>
              <div style={{ fontSize: 20, color: theme.colors.textMuted, marginTop: 8 }}>{metric.label}</div>
            </div>
          );
        })}
      </div>
      {note && (
        <p
          style={{
            marginTop: 50,
            fontSize: 20,
            color: theme.colors.textMuted,
            opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
