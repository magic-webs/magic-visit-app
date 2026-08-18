// Derives this app's small brand-color surface (the `brand.teal`/`brand.gold`
// Tailwind tokens — see tailwind.config.js) from a tenant's saved theme
// (primary/secondary base tokens, same ThemeBaseTokens shape the panel
// edits). Status/availability colors are NEVER derived here — they're fixed
// semantic colors (green = sold, etc.) and stay hardcoded in
// constants/theme.ts regardless of tenant branding.
import { parseOklch, mixOklch, oklchToHex, oklchToRgbTriplet, lighten, type Oklch } from "./oklch";

export interface ThemeBaseTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  destructive: string;
}

export interface BrandVars {
  // Explicit index signature so this satisfies NativeWind's vars() param
  // type (Record<`--${string}`, string | number>) as-is, with no cast.
  [key: `--${string}`]: string;
  "--color-brand-teal": string;
  "--color-brand-teal-hover": string;
  "--color-brand-teal-light": string;
  "--color-brand-gold-50": string;
  "--color-brand-gold-100": string;
  "--color-brand-gold-200": string;
  "--color-brand-gold-border": string;
}

export interface ResolvedBrand {
  vars: BrandVars;
  gradientPrimary: readonly [string, string, string];
  navigation: { primary: string; background: string; border: string };
  // The solid "lip" color sat behind a primary Button's face at rest (see
  // components/ui/Button.tsx's own comment on the 3D-lip trick) — a plain
  // hex, not a CSS var, because Button.tsx sets it via a plain `style`
  // background-color, not a NativeWind class. Darkened the same way the
  // panel's own preview derives it (magic-visit-panel/lib/theme/
  // derive-brand-vars.ts's deriveMobileBrand), so the preview and the real
  // app agree.
  buttonEdge: string;
  // Plain hex counterpart of `vars["--color-brand-gold-border"]` — for the
  // handful of direct (non-NativeWind-class) reads of the gold border color,
  // e.g. the Accountant role badge in constants/theme.ts's ROLE_STYLES.
  goldBorderHex: string;
  // A CSS font-family stack (e.g. "Georgia, 'Times New Roman', serif") from
  // the panel's theme editor (lib/theme/presets.ts's FONT_OPTIONS there).
  // Only meaningfully applied on web (see app/_layout.tsx) — these are web
  // font stacks, not real RN font family names, and native font loading
  // (bundling actual font files per choice) isn't built yet.
  fontFamily: string;
}

const DEFAULT_FONT_FAMILY = "Inter, ui-sans-serif, system-ui, sans-serif";

// A light neutral/gold-ish scale derived from `secondary`, sharing its hue
// but varying lightness/chroma — solved to land close to the current
// hardcoded gold scale when secondary approximates that palette's own
// warm-cream secondary tone.
function deriveGoldScale(secondary: Oklch) {
  const near = (l: number, c: number): Oklch => ({ l, c, h: secondary.h });
  return {
    "50": near(0.98, Math.min(0.02, secondary.c * 0.3 + 0.01)),
    "100": near(0.95, Math.min(0.035, secondary.c * 0.4 + 0.015)),
    "200": near(0.9, Math.min(0.05, secondary.c * 0.5 + 0.02)),
    border: near(0.82, Math.min(0.08, secondary.c * 0.6 + 0.03)),
  };
}

export function deriveResolvedBrand(base: ThemeBaseTokens, fontFamily?: string): ResolvedBrand {
  const primary = parseOklch(base.primary);
  const secondary = parseOklch(base.secondary);

  const tealHover = lighten(primary, 0.05);
  const tealLight = lighten(primary, 0.12);
  const edge = lighten(primary, -0.12);
  const gold = deriveGoldScale(secondary);

  return {
    vars: {
      "--color-brand-teal": oklchToRgbTriplet(primary),
      "--color-brand-teal-hover": oklchToRgbTriplet(tealHover),
      "--color-brand-teal-light": oklchToRgbTriplet(tealLight),
      "--color-brand-gold-50": oklchToRgbTriplet(gold["50"]),
      "--color-brand-gold-100": oklchToRgbTriplet(gold["100"]),
      "--color-brand-gold-200": oklchToRgbTriplet(gold["200"]),
      "--color-brand-gold-border": oklchToRgbTriplet(gold.border),
    },
    gradientPrimary: [oklchToHex(primary), oklchToHex(tealHover), oklchToHex(tealLight)],
    navigation: {
      primary: oklchToHex(primary),
      background: oklchToHex(mixOklch(gold["50"], gold["50"], 0)),
      border: oklchToHex(gold.border),
    },
    buttonEdge: oklchToHex(edge),
    goldBorderHex: oklchToHex(gold.border),
    fontFamily: fontFamily || DEFAULT_FONT_FAMILY,
  };
}
