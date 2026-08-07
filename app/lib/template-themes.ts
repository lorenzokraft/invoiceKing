// Shared visual themes for invoice templates.
// Each theme drives colors and header layout in the real invoice renderer
// (app.invoice.$orderId.tsx) and the template editor preview (app.templates.tsx).

export type TemplateTheme = {
  id: string;
  name: string;
  // Core colors
  ink: string; // main text
  sub: string; // secondary text
  line: string; // borders / dividers
  accent: string; // accent color (totals, links, highlights)
  // Table header
  headBg: string;
  headInk: string;
  // Header layout: "classic" = logo left / title right, "banner" = full-width colored banner
  layout: "classic" | "banner" | "centered";
  // Banner background (only used when layout is banner/centered)
  bannerBg: string;
  bannerInk: string;
  // Font family
  fontFamily: string;
};

const base = {
  ink: "#1a1a1a",
  sub: "#6d6f80",
  line: "#e1e3e5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
  slim: {
    ...base,
    id: "slim",
    name: "Slim",
    accent: "#1a1a1a",
    headBg: "#ffffff",
    headInk: "#1a1a1a",
    layout: "classic",
    bannerBg: "#ffffff",
    bannerInk: "#1a1a1a",
  },
  pure: {
    ...base,
    id: "pure",
    name: "Pure",
    accent: "#1a1a1a",
    headBg: "#f4f4f4",
    headInk: "#1a1a1a",
    layout: "classic",
    bannerBg: "#ffffff",
    bannerInk: "#1a1a1a",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  agile: {
    ...base,
    id: "agile",
    name: "Agile",
    accent: "#2f6f4f",
    headBg: "#2f6f4f",
    headInk: "#ffffff",
    layout: "classic",
    bannerBg: "#ffffff",
    bannerInk: "#1a1a1a",
  },
  aqua: {
    ...base,
    id: "aqua",
    name: "Aqua",
    accent: "#0e7c86",
    headBg: "#e6f4f5",
    headInk: "#0e7c86",
    layout: "classic",
    bannerBg: "#ffffff",
    bannerInk: "#0e7c86",
  },
  aurora: {
    ...base,
    id: "aurora",
    name: "Aurora",
    accent: "#26413c",
    headBg: "#26413c",
    headInk: "#ffffff",
    layout: "banner",
    bannerBg: "#26413c",
    bannerInk: "#ffffff",
  },
  epoch: {
    ...base,
    id: "epoch",
    name: "Epoch",
    accent: "#111111",
    headBg: "#111111",
    headInk: "#ffffff",
    layout: "banner",
    bannerBg: "#111111",
    bannerInk: "#ffffff",
  },
  leo: {
    ...base,
    id: "leo",
    name: "Leo",
    accent: "#8a5a2b",
    headBg: "#1a1a1a",
    headInk: "#ffffff",
    layout: "centered",
    bannerBg: "#1a1a1a",
    bannerInk: "#ffffff",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  ocean: {
    ...base,
    id: "ocean",
    name: "Ocean",
    accent: "#0d5c75",
    headBg: "#0d1b2a",
    headInk: "#ffffff",
    layout: "banner",
    bannerBg: "#0d1b2a",
    bannerInk: "#ffffff",
  },
  retro: {
    ...base,
    id: "retro",
    name: "Retro",
    accent: "#c0392b",
    headBg: "#191919",
    headInk: "#f5e9d6",
    layout: "banner",
    bannerBg: "#191919",
    bannerInk: "#f5e9d6",
  },
  rhythm: {
    ...base,
    id: "rhythm",
    name: "Rhythm",
    accent: "#5b3ea6",
    headBg: "#f0ecfa",
    headInk: "#5b3ea6",
    layout: "classic",
    bannerBg: "#ffffff",
    bannerInk: "#5b3ea6",
  },
};

export function getTemplateTheme(styleId?: string | null): TemplateTheme {
  return TEMPLATE_THEMES[styleId || "slim"] || TEMPLATE_THEMES.slim;
}
