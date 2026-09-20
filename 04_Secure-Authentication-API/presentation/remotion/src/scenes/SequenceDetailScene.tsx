import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

interface SequenceDetailSceneProps {
  eyebrow: string;
  heading: string;
  subheading: string;
  steps: string[];
  invariant?: string;
  chapter?: string;
}

export function SequenceDetailScene({
  eyebrow,
  heading,
  subheading,
  steps,
  invariant,
  chapter = "CH 04",
}: SequenceDetailSceneProps) {
  const frame = useCurrentFrame();

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        {eyebrow}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 36 }}>
        <h2 style={{ fontSize: 38, margin: 0 }}>{heading}</h2>
        <span style={{ fontSize: 15, color: theme.colors.textMuted, fontFamily: theme.font.mono }}>
          {subheading}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {steps.map((step, i) => {
          const start = i * 12;
          const opacity = interpolate(frame, [start, start + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + 14], [-20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={step}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                gap: 18,
                alignItems: "center",
                fontSize: 20,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.primary}`,
                  color: theme.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: theme.colors.text, fontFamily: theme.font.mono, fontSize: 19 }}>{step}</span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      {invariant && (
        <div
          style={{
            padding: "18px 24px",
            background: "rgba(249,115,22,0.08)",
            borderLeft: `4px solid ${theme.colors.primary}`,
            borderRadius: 8,
            fontSize: 19,
            color: theme.colors.text,
            lineHeight: 1.45,
            opacity: interpolate(frame, [steps.length * 12 + 20, steps.length * 12 + 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <strong style={{ color: theme.colors.primary }}>Invariant: </strong>
          {invariant}
        </div>
      )}
    </SlideFrame>
  );
}
