import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

const COMPONENTS = ["React SPA", "FastAPI routes", "services", "repositories", "PostgreSQL"];

export function ArchitectureScene({ chapter = "CH 03" }: { chapter?: string }) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        03 · SYSTEM ARCHITECTURE
      </div>
      <h2 style={{ fontSize: 44, margin: "0 0 20px" }}>Real Request Flow</h2>
      <p style={{ fontSize: 18, color: theme.colors.textMuted, marginBottom: 56, maxWidth: 1100 }}>
        One-directional dependency flow — api/ → services/ → repositories/, per
        rules/15-backend-structure.md
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {COMPONENTS.map((name, i) => {
          const boxStart = i * 20;
          const boxOpacity = interpolate(frame, [boxStart, boxStart + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const arrowOpacity = interpolate(frame, [boxStart + 15, boxStart + 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={name} style={{ display: "flex", alignItems: "center", flex: i < COMPONENTS.length - 1 ? 1 : "0 0 auto" }}>
              <div
                style={{
                  opacity: boxOpacity,
                  backgroundColor: theme.colors.panel,
                  border: `2px solid ${theme.colors.primary}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                  fontSize: 20,
                  color: theme.colors.text,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {name}
              </div>
              {i < COMPONENTS.length - 1 && (
                <div style={{ opacity: arrowOpacity, fontSize: 28, color: theme.colors.textMuted, padding: "0 12px", flexShrink: 0 }}>
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
    </SlideFrame>
  );
}

interface StackSceneProps {
  rows: { layer: string; tech: string }[];
  chapter?: string;
}

export function StackScene({ rows, chapter = "CH 03" }: StackSceneProps) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        03 · TECHNOLOGY STACK
      </div>
      <h2 style={{ fontSize: 44, margin: "0 0 48px" }}>What, and Why</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {rows.map((row, i) => {
          const opacity = interpolate(frame, [i * 10, i * 10 + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={row.layer}
              style={{
                opacity,
                background: theme.colors.panel,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 10,
                padding: "20px 24px",
              }}
            >
              <div style={{ color: theme.colors.primary, fontSize: 15, letterSpacing: "0.08em", marginBottom: 8 }}>
                {row.layer.toUpperCase()}
              </div>
              <div style={{ color: theme.colors.text, fontSize: 21 }}>{row.tech}</div>
            </div>
          );
        })}
      </div>
    </SlideFrame>
  );
}
