import type { CSSProperties } from "react";

// SaffronyxAI.in brand palette — same tokens as presentation/html/css/variables.css and
// presentation/pdf-style-guide.md Section 2. Never redefined independently per scene.
export const theme = {
  colors: {
    bg: "#050301", // Obsidian
    panel: "#15100a",
    border: "#3a2e1e",
    text: "#FFF7ED", // Off-White
    textMuted: "#c9b79f",
    primary: "#F97316", // Saffron Orange
    gold: "#EAB308", // Turmeric Gold
    cream: "#FDBA74", // Warm Cream
    success: "#3ecf8e",
    danger: "#ff6b6b",
    warning: "#EAB308",
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
