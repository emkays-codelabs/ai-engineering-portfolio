import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { container, theme } from "../theme";

export function TitleScene({ title, hook }: { title: string; hook: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 14 } });
  const hookOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={container}>
      <div style={{ transform: `scale(${titleScale})`, textAlign: "center" }}>
        <h1 style={{ fontSize: 72, margin: 0, color: theme.colors.text }}>{title}</h1>
      </div>
      <p
        style={{
          fontSize: 30,
          color: theme.colors.textMuted,
          opacity: hookOpacity,
          marginTop: 24,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {hook}
      </p>
    </div>
  );
}
