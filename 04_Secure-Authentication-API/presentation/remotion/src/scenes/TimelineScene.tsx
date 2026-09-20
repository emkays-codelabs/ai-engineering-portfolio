import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

const ROADMAP = [
  "Rate limiting on auth endpoints — NOT IMPLEMENTED",
  "Scheduled cleanup of expired revocation records — NOT IMPLEMENTED",
  "SECRET_KEY rotation mechanism — NOT IMPLEMENTED",
  "Admin-provisioning endpoint — NOT IMPLEMENTED",
];

export function TimelineScene() {
  const frame = useCurrentFrame();

  return (
    <div style={container}>
      <h2 style={{ fontSize: 40, marginBottom: 40 }}>Future Roadmap — Disclosed, Not Hidden</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ROADMAP.map((item, i) => {
          const opacity = interpolate(frame, [i * 10, i * 10 + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={item} style={{ opacity, fontSize: 22, color: theme.colors.warning }}>
              ○ {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
