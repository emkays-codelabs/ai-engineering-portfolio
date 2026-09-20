import type { CSSProperties } from "react";

export const theme = {
  colors: {
    bg: "#0b1120",
    bgAlt: "#111a2e",
    panel: "#16213a",
    border: "#26355a",
    text: "#e6ebf5",
    textMuted: "#8fa0c4",
    primary: "#4f8cff",
    success: "#3ecf8e",
    danger: "#ff6b6b",
    warning: "#ffb84f",
  },
  font: {
    family: "'Segoe UI', 'Inter', system-ui, sans-serif",
    mono: "'Cascadia Code', 'Consolas', monospace",
  },
} as const;

export const container: CSSProperties = {
  width: "100%",
  height: "100%",
  backgroundColor: theme.colors.bg,
  color: theme.colors.text,
  fontFamily: theme.font.family,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: 80,
  boxSizing: "border-box",
};
