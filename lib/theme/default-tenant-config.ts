import type { ResolvedBrand } from "./derive-brand-vars";

// Exact current production values (see constants/theme.js), hardcoded here
// rather than round-tripped through OKLCH — this is what renders until a
// tenant has an actual saved theme/branding row (which won't exist yet for
// any tenant until the panel is used to set one), and it must stay pixel-
// identical to today's app so nothing visually changes on its own.
export const DEFAULT_RESOLVED_BRAND: ResolvedBrand = {
  vars: {
    "--color-brand-teal": "9 121 105",
    "--color-brand-teal-hover": "10 144 112",
    "--color-brand-teal-light": "11 184 133",
    "--color-brand-gold-50": "253 248 237",
    "--color-brand-gold-100": "250 240 208",
    "--color-brand-gold-200": "245 232 184",
    "--color-brand-gold-border": "232 217 138",
  },
  gradientPrimary: ["#097969", "#0a9070", "#0bb885"],
  navigation: { primary: "#097969", background: "#fdf8ed", border: "#e8d98a" },
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export const DEFAULT_BRANDING = {
  appName: "magic-visit-app",
  shortName: null as string | null,
  logoLightUrl: null as string | null,
  logoDarkUrl: null as string | null,
  iconUrl: null as string | null,
  customDomain: null as string | null,
};
