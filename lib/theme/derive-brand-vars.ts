// Derives the `brand.teal`/`brand.gold` Tailwind tokens from a tenant's saved
// theme. Status/availability colors are never derived here — they're fixed
// semantic colors and stay hardcoded in constants/theme.ts.
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
  // Index signature so this satisfies NativeWind's vars() param type as-is.
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
  // Button's 3D-lip color, as a plain hex (not a CSS var) since Button.tsx
  // sets it via inline `style`, not a NativeWind class. Darkened the same way
  // the panel's own preview derives it, so the two stay in agreement.
  buttonEdge: string;
  // Plain hex counterpart of `vars["--color-brand-gold-border"]`, for direct
  // (non-NativeWind-class) reads, e.g. constants/theme.ts's ROLE_STYLES.
  goldBorderHex: string;
  // CSS font-family stack from the panel's theme editor. Web-only for now
  // (see app/_layout.tsx) — native font loading isn't built yet.
  fontFamily: string;
}

const DEFAULT_FONT_FAMILY = "Inter, ui-sans-serif, system-ui, sans-serif";

// Light neutral/gold-ish scale derived from `secondary`'s hue, tuned to land
// close to the hardcoded gold scale when secondary is a similar warm cream.
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
