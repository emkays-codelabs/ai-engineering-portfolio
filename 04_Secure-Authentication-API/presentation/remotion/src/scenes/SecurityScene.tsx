import { interpolate, useCurrentFrame } from "remotion";

import { SlideFrame } from "../SlideFrame";
import { theme } from "../theme";

export function SecurityScene({ chapter = "CH 06" }: { chapter?: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SlideFrame chapter={chapter}>
      <div style={{ fontSize: 16, color: theme.colors.primary, letterSpacing: "0.12em", marginBottom: 12 }}>
        06 · SECURITY
      </div>
      <h2 style={{ fontSize: 44, margin: "0 0 48px" }}>Trust Boundaries</h2>
      <div style={{ opacity, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div
          style={{
            backgroundColor: theme.colors.panel,
            border: `2px solid ${theme.colors.textMuted}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          <h3 style={{ fontSize: 22, color: theme.colors.textMuted, marginTop: 0 }}>Untrusted: Browser JS</h3>
          <p style={{ fontSize: 19, color: theme.colors.text, lineHeight: 1.5 }}>
            Holds: access_token only — in memory, never localStorage
          </p>
        </div>
        <div
          style={{
            backgroundColor: theme.colors.panel,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          <h3 style={{ fontSize: 22, color: theme.colors.primary, marginTop: 0 }}>Trust Boundary: API</h3>
          <p style={{ fontSize: 19, color: theme.colors.text, lineHeight: 1.5 }}>
            Validates sig/alg/exp/type/sub on every request. Re-fetches role from DB — never
            trusts the JWT claim alone for RBAC.
          </p>
        </div>
      </div>
      <p
        style={{
          marginTop: 40,
          fontSize: 20,
          color: theme.colors.textMuted,
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Refresh token: HttpOnly cookie — never reachable by JavaScript. See ADR-0002.
      </p>
    </SlideFrame>
  );
}
