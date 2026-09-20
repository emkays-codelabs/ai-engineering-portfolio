import type { CSSProperties, ReactNode } from "react";

import { theme } from "./theme";

const frameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  backgroundColor: theme.colors.bg,
  color: theme.colors.text,
  fontFamily: theme.font.family,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "36px 80px 0",
  fontSize: 15,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: theme.colors.textMuted,
  flexShrink: 0,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 80px 32px",
  fontSize: 14,
  color: theme.colors.textMuted,
  flexShrink: 0,
};

interface SlideFrameProps {
  chapter?: string; // e.g. "CH 05" — omitted on cover/closing
  children: ReactNode;
  bare?: boolean; // true = no header/footer chrome, for cover/chapter-card/closing
}

/** Standard corporate-deck chrome: brand header + full-width content + footer.
 * Content is never force-centered — each scene lays out its own content within
 * the content zone, left-aligned/spread per rules/16 "corporate style" feedback. */
export function SlideFrame({ chapter, children, bare = false }: SlideFrameProps) {
  if (bare) {
    return <div style={frameStyle}>{children}</div>;
  }
  return (
    <div style={frameStyle}>
      <div style={headerStyle}>
        <span style={{ color: theme.colors.primary, fontWeight: 700 }}>SaffronyxAI.in</span>
        <span>Secure Authentication API</span>
      </div>
      <div style={{ flex: 1, padding: "40px 80px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      <div style={footerStyle}>
        <span>© 2026 SaffronyxAI.in</span>
        <span>{chapter ?? ""} · EP 01</span>
      </div>
    </div>
  );
}
