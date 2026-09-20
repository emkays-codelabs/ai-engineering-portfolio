import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

interface CodeSceneProps {
  title: string;
  filename: string;
  code: string;
  explanation: string;
}

export function CodeScene({ title, filename, code, explanation }: CodeSceneProps) {
  const frame = useCurrentFrame();
  const codeOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const explanationOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ ...container, alignItems: "stretch", justifyContent: "flex-start", paddingTop: 60 }}>
      <h2 style={{ fontSize: 38, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 18, color: theme.colors.textMuted, marginBottom: 20 }}>{filename}</p>
      <pre
        style={{
          opacity: codeOpacity,
          backgroundColor: theme.colors.panel,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 10,
          padding: 24,
          fontSize: 18,
          fontFamily: theme.font.mono,
          color: theme.colors.text,
          overflow: "hidden",
          whiteSpace: "pre",
        }}
      >
        {code}
      </pre>
      <p
        style={{
          opacity: explanationOpacity,
          fontSize: 22,
          color: theme.colors.success,
          marginTop: 24,
        }}
      >
        {explanation}
      </p>
    </div>
  );
}
