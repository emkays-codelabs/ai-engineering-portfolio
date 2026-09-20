import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

const COMPONENTS = ["React SPA", "FastAPI routes", "services", "repositories", "PostgreSQL"];

export function ArchitectureScene() {
  const frame = useCurrentFrame();

  return (
    <div style={container}>
      <h2 style={{ fontSize: 44, marginBottom: 60 }}>Architecture — Real Request Flow</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {COMPONENTS.map((name, i) => {
          const boxStart = i * 20;
          const boxOpacity = interpolate(frame, [boxStart, boxStart + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const arrowOpacity = interpolate(
            frame,
            [boxStart + 15, boxStart + 25],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div key={name} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  opacity: boxOpacity,
                  backgroundColor: theme.colors.panel,
                  border: `2px solid ${theme.colors.primary}`,
                  borderRadius: 12,
                  padding: "20px 24px",
                  fontSize: 22,
                  color: theme.colors.text,
                  minWidth: 140,
                  textAlign: "center",
                }}
              >
                {name}
              </div>
              {i < COMPONENTS.length - 1 && (
                <div style={{ opacity: arrowOpacity, fontSize: 32, color: theme.colors.textMuted, margin: "0 10px" }}>
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p
        style={{
          marginTop: 50,
          fontSize: 22,
          color: theme.colors.textMuted,
          opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        One-directional dependency flow — api/ → services/ → repositories/ (rules/15-backend-structure.md)
      </p>
    </div>
  );
}

interface StackSceneProps {
  rows: { layer: string; tech: string }[];
}

export function StackScene({ rows }: StackSceneProps) {
  const frame = useCurrentFrame();

  return (
    <div style={container}>
      <h2 style={{ fontSize: 44, marginBottom: 40 }}>Technology Stack</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 720 }}>
        {rows.map((row, i) => {
          const opacity = interpolate(frame, [i * 8, i * 8 + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={row.layer}
              style={{
                opacity,
                display: "flex",
                justifyContent: "space-between",
                borderBottom: `1px solid ${theme.colors.border}`,
                paddingBottom: 10,
                fontSize: 24,
              }}
            >
              <span style={{ color: theme.colors.textMuted }}>{row.layer}</span>
              <span style={{ color: theme.colors.text, fontWeight: 600 }}>{row.tech}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
