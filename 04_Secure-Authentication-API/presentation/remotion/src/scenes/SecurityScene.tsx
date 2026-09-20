import { interpolate, useCurrentFrame } from "remotion";

import { container, theme } from "../theme";

export function SecurityScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={container}>
      <h2 style={{ fontSize: 44, marginBottom: 40 }}>Security — Trust Boundaries</h2>
      <div style={{ opacity, display: "flex", gap: 40, alignItems: "stretch" }}>
        <div
          style={{
            backgroundColor: theme.colors.panel,
            border: `2px solid ${theme.colors.textMuted}`,
            borderRadius: 12,
            padding: 24,
            width: 280,
          }}
        >
          <h3 style={{ fontSize: 22, color: theme.colors.textMuted, marginTop: 0 }}>
            Untrusted: Browser JS
          </h3>
          <p style={{ fontSize: 18, color: theme.colors.text }}>
            Holds: access_token only (in memory, never localStorage)
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 32,
            color: theme.colors.warning,
          }}
        >
          ⇄
        </div>
        <div
          style={{
            backgroundColor: theme.colors.panel,
            border: `2px solid ${theme.colors.success}`,
            borderRadius: 12,
            padding: 24,
            width: 320,
          }}
        >
          <h3 style={{ fontSize: 22, color: theme.colors.success, marginTop: 0 }}>
            Trust boundary: API
          </h3>
          <p style={{ fontSize: 18, color: theme.colors.text }}>
            Validates sig/alg/exp/type/sub on every request. Re-fetches role from DB — never
            trusts the JWT claim alone for RBAC.
          </p>
        </div>
      </div>
      <p
        style={{
          marginTop: 50,
          fontSize: 22,
          color: theme.colors.textMuted,
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Refresh token: HttpOnly cookie — never reachable by JavaScript. See ADR-0002.
      </p>
    </div>
  );
}
