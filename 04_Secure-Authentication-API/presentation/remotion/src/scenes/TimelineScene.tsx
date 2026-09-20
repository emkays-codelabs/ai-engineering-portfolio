import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

const ROADMAP = [
  "Rate limiting on auth endpoints",
  "Scheduled cleanup of expired revocation records",
  "SECRET_KEY rotation mechanism",
  "Admin-provisioning endpoint",
];

export function TimelineScene({ chapter = "CH 09" }: { chapter?: string }) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        09 · FUTURE ROADMAP
      </div>
      <h2 style={{ fontSize: 42, margin: "0 0 44px" }}>Disclosed, Not Hidden</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {ROADMAP.map((item, i) => {
          const opacity = interpolate(frame, [i * 12, i * 12 + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={item}
              style={{
                opacity,
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: theme.colors.panel,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 10,
                padding: "22px 26px",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: theme.colors.gold,
                  border: `1px solid ${theme.colors.gold}`,
                  borderRadius: 999,
                  padding: "4px 12px",
                  flexShrink: 0,
                }}
              >
                NOT IMPLEMENTED
              </span>
              <span style={{ fontSize: 21, color: theme.colors.text }}>{item}</span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <p style={{ fontSize: 18, color: theme.colors.textMuted }}>Source: docs/SECURITY.md §10</p>
    </SlideFrame>
  );
}
