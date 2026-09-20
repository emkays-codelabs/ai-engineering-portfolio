import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

const STEPS = [
  "Register — bcrypt hash, role hardcoded to USER",
  "Login — OAuth2 Password Flow",
  "access_token (body) + refresh_token (HttpOnly cookie)",
  "Protected call — Authorization: Bearer <access_token>",
  "Access token expires (15 min) → POST /auth/refresh",
  "Old refresh jti blacklisted, new pair issued",
  "Logout — jti blacklisted, cookie cleared",
];

export function WorkflowScene() {
  const frame = useCurrentFrame();

  return (
    <div style={container}>
      <h2 style={{ fontSize: 44, marginBottom: 40 }}>Core Workflow — End to End</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 900 }}>
        {STEPS.map((step, i) => {
          const start = i * 22;
          const opacity = interpolate(frame, [start, start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={step}
              style={{
                opacity,
                display: "flex",
                alignItems: "center",
                gap: 20,
                fontSize: 24,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: theme.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ color: theme.colors.text }}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
