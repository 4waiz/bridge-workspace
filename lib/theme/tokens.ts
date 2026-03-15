export const brandTokens = {
  primary: "#E36436",
  primaryHover: "#CF582F",
  ink: "#454B50",
  inkStrong: "#2F353A",
  background: "#F4F4F2",
  surface: "#FFFFFF",
  border: "#D9D7D2",
  muted: "#6B7280",
  success: "#0F766E",
  warning: "#C2410C",
} as const;

export const classificationPalette = {
  public: {
    background: "rgba(15, 118, 110, 0.12)",
    foreground: "#0F766E",
    border: "rgba(15, 118, 110, 0.24)",
  },
  internal: {
    background: "rgba(227, 100, 54, 0.12)",
    foreground: "#CF582F",
    border: "rgba(227, 100, 54, 0.22)",
  },
  restricted: {
    background: "rgba(194, 65, 12, 0.12)",
    foreground: "#C2410C",
    border: "rgba(194, 65, 12, 0.24)",
  },
} as const;
