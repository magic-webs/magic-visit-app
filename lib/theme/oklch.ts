// Pure OKLCH -> sRGB conversion, ported from magic-visit-panel/lib/theme/oklch.ts.
// No DOM/React/RN imports on purpose. Math follows Björn Ottosson's OKLab
// reference: https://bottosson.github.io/posts/oklab/

export interface Oklch {
  l: number; // 0..1
  c: number; // chroma, typically 0..~0.4
  h: number; // hue, degrees 0..360
}

const OKLCH_RE = /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*(?:\/[^)]+)?\)/i;

/** Parses a CSS `oklch(L C H)` string (ignores an alpha component, if present). */
export function parseOklch(input: string): Oklch {
  const match = OKLCH_RE.exec(input.trim());
  if (!match) {
    throw new Error(`Not a valid oklch() string: "${input}"`);
  }
  const [, lRaw, cRaw, hRaw] = match;
  return { l: Number(lRaw), c: Number(cRaw), h: Number(hRaw) };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function cbrt(x: number): number {
  return Math.sign(x) * Math.abs(x) ** (1 / 3);
}

interface LinearRgb {
  r: number;
  g: number;
  b: number;
}

function oklchToOklab(color: Oklch): { l: number; a: number; b: number } {
  const hRad = (color.h * Math.PI) / 180;
  return { l: color.l, a: color.c * Math.cos(hRad), b: color.c * Math.sin(hRad) };
}

function oklabToLinearSrgb(lab: { l: number; a: number; b: number }): LinearRgb {
  const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function linearToGamma(c: number): number {
  const clamped = clamp01(c);
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

export interface Rgb {
  r: number; // 0..255
  g: number;
  b: number;
}

export function oklchToRgb(color: Oklch): Rgb {
  const lab = oklchToOklab(color);
  const linear = oklabToLinearSrgb(lab);
  return {
    r: Math.round(clamp01(linearToGamma(linear.r)) * 255),
    g: Math.round(clamp01(linearToGamma(linear.g)) * 255),
    b: Math.round(clamp01(linearToGamma(linear.b)) * 255),
  };
}

function toHex2(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
}

export function oklchToHex(color: Oklch): string {
  const { r, g, b } = oklchToRgb(color);
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

/** "R G B" space-separated decimal — the format NativeWind's vars() needs for the `rgb(var(--x) / <alpha-value>)` color pattern. */
export function oklchToRgbTriplet(color: Oklch): string {
  const { r, g, b } = oklchToRgb(color);
  return `${r} ${g} ${b}`;
}

/** Linear interpolation, wrapping correctly around the 0/360 hue seam. */
function lerpHue(h1: number, h2: number, t: number): number {
  const delta = ((h2 - h1 + 540) % 360) - 180;
  return (h1 + delta * t + 360) % 360;
}

export function mixOklch(a: Oklch, b: Oklch, t: number): Oklch {
  const clampedT = clamp01(t);
  return {
    l: a.l + (b.l - a.l) * clampedT,
    c: a.c + (b.c - a.c) * clampedT,
    h: a.c === 0 && b.c === 0 ? a.h : lerpHue(a.h, b.h, clampedT),
  };
}

export function lighten(color: Oklch, amount: number): Oklch {
  return { ...color, l: clamp01(color.l + amount) };
}
