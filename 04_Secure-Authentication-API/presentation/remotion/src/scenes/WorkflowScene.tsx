import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

const STEPS = [
  "Register — bcrypt hash, role hardcoded to USER",
  "Login — OAuth2 Password Flow",
  "access_token (body) + refresh_token (HttpOnly cookie)",
  "Protected call — Authorization: Bearer <access_token>",
  "Access token expires (15 min) → POST /auth/refresh",
  "Old refresh jti blacklisted, new pair issued",
  "Logout — jti blacklisted, cookie cleared",
];

export function WorkflowScene({ chapter = "CH 03" }: { chapter?: string }) {
  const frame = useCurrentFrame();
  const left = STEPS.slice(0, 4);
  const right = STEPS.slice(4);

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        CORE WORKFLOW
      </div>
      <h2 style={{ fontSize: 44, margin: "0 0 48px" }}>End to End</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 48px", flex: 1, alignContent: "start" }}>
        {[left, right].map((col, colIdx) => (
          <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {col.map((step, i) => {
              const idx = colIdx === 0 ? i : i + left.length;
              const start = idx * 20;
              const opacity = interpolate(frame, [start, start + 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={step} style={{ opacity, display: "flex", alignItems: "flex-start", gap: 18, fontSize: 22 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span style={{ color: theme.colors.text, lineHeight: 1.35 }}>{step}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
