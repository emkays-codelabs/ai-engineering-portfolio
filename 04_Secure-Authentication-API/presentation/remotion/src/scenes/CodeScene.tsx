import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

interface CodeSceneProps {
  title: string;
  filename: string;
  code: string;
  explanation: string;
  chapter?: string;
}

export function CodeScene({ title, filename, code, explanation, chapter = "CH 05" }: CodeSceneProps) {
  const frame = useCurrentFrame();
  const codeOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const explanationOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        05 · CODE WALKTHROUGH
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
        <h2 style={{ fontSize: 34, margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.font.mono }}>{filename}</span>
      </div>
      <pre
        style={{
          opacity: codeOpacity,
          backgroundColor: theme.colors.panel,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 10,
          padding: 28,
          fontSize: 18,
          fontFamily: theme.font.mono,
          color: theme.colors.text,
          overflow: "hidden",
          whiteSpace: "pre",
          flex: 1,
        }}
      >
        {code}
      </pre>
      <p
        style={{
          opacity: explanationOpacity,
          fontSize: 20,
          color: theme.colors.gold,
          marginTop: 20,
        }}
      >
        → {explanation}
      </p>
    </SlideFrame>
  );
}
