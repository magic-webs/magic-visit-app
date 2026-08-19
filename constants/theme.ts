import type { Theme } from "expo-router";

// Also defined in ./theme.js (restated here rather than imported — mixing a
// TS import with tailwind.config.js's require() of that CJS file hit
// CommonJS/ESM interop issues under allowJs).
export const theme = {
  teal: {
    DEFAULT: "#097969",
    hover: "#0a9070",
    light: "#0bb885",
    // Button's 3D-lip color (components/ui/Button.tsx) — mutated in place
    // by applyResolvedBrandColors() below, same as the other teal shades.
    edge: "#065c50",
  },
  gold: {
    50: "#fdf8ed",
    100: "#faf0d0",
    200: "#f5e8b8",
    border: "#e8d98a",
  },
  status: {
    sold: "#22c55e",
    notInterested: "#ef4444",
    notAvailable: "#f59e0b",
    windowShopping: "#3b82f6",
    followUp: "#8b5cf6",
    none: "#9ca3af",
  },
  availability: {
    available: "#22c55e",
    busy: "#ef4444",
    offline: "#9ca3af",
  },
  gradients: {
    // Typed as a mutable 3-tuple (not `as const`) so applyResolvedBrandColors
    // below can reassign elements in place while still satisfying
    // GradientView's `colors` prop (which requires at least 2 elements).
    primary: ["#097969", "#0a9070", "#0bb885"] as [string, string, string],
    gold: ["#fdf8ed", "#faf0d0", "#f5e8b8"] as const,
  },
};

// `theme.teal`/`theme.gradients.primary` are read directly (not via a
// Tailwind class) by ~25 files, so a CSS-variable fix can't reach them; this
// mutates the shared `theme` object in place once the tenant's brand
// resolves, and every consumer picks it up on its next render. Makes `theme`
// a mutable, tenant-aware singleton rather than a pure constant.
// Caveat: only a read inside a function body (render-time) stays live — a
// plain object built at module load (e.g. `const x = { c: theme.teal.DEFAULT }`)
// captures the value once and never sees later mutations. See ROLE_STYLES below.
export function applyResolvedBrandColors(colors: {
  primary: string;
  hover: string;
  light: string;
  edge: string;
  goldBorder: string;
}): void {
  theme.teal.DEFAULT = colors.primary;
  theme.teal.hover = colors.hover;
  theme.teal.light = colors.light;
  theme.teal.edge = colors.edge;
  theme.gold.border = colors.goldBorder;
  theme.gradients.primary[0] = colors.primary;
  theme.gradients.primary[1] = colors.hover;
  theme.gradients.primary[2] = colors.light;
}

export type VisitorStatus = "sold" | "not_interested" | "not_available" | "window_shopping" | "follow_up" | "none";

export const STATUS_STYLES: Record<VisitorStatus, { color: string; label: string }> = {
  sold: { color: theme.status.sold, label: "Sold" },
  not_interested: { color: theme.status.notInterested, label: "Not Interested" },
  not_available: { color: theme.status.notAvailable, label: "Not Available" },
  window_shopping: { color: theme.status.windowShopping, label: "Window Shopping" },
  follow_up: { color: theme.status.followUp, label: "Follow Up" },
  none: { color: theme.status.none, label: "—" },
};

export type AvailabilityStatus = "available" | "busy" | "offline";

export const AVAILABILITY_STYLES: Record<AvailabilityStatus, { color: string; label: string }> = {
  available: { color: theme.availability.available, label: "Available" },
  busy: { color: theme.availability.busy, label: "Busy" },
  offline: { color: theme.availability.offline, label: "Offline" },
};

export type DiscountRequestStatus = "pending_otp" | "applied" | "cancelled" | "locked";

export const DISCOUNT_STATUS_STYLES: Record<DiscountRequestStatus, { color: string; label: string }> = {
  pending_otp: { color: theme.status.notAvailable, label: "Awaiting code" },
  applied: { color: theme.status.sold, label: "Applied" },
  cancelled: { color: theme.status.none, label: "Cancelled" },
  locked: { color: theme.status.notInterested, label: "Locked" },
};

export type StaffRole = "owner" | "branch_manager" | "receptionist" | "salesperson" | "accountant";

// A function, not a frozen object, so `owner`/`branch_manager`/`accountant`
// re-read the mutable `theme.teal`/`theme.gold` shades fresh on each call
// (see applyResolvedBrandColors above) instead of freezing at module load.
export function getRoleStyles(): Record<StaffRole, { color: string; label: string }> {
  return {
    owner: { color: theme.teal.DEFAULT, label: "Owner" },
    branch_manager: { color: theme.teal.hover, label: "Branch Manager" },
    receptionist: { color: theme.status.windowShopping, label: "Receptionist" },
    salesperson: { color: theme.status.followUp, label: "Salesperson" },
    accountant: { color: theme.gold.border, label: "Accountant" },
  };
}

const fonts: Theme["fonts"] = {
  regular: { fontFamily: "Inter_400Regular", fontWeight: "400" },
  medium: { fontFamily: "Inter_500Medium", fontWeight: "500" },
  bold: { fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  heavy: { fontFamily: "Inter_700Bold", fontWeight: "700" },
};

export const AppNavigationTheme: Theme = {
  dark: false,
  colors: {
    primary: theme.teal.DEFAULT,
    background: theme.gold[50],
    card: "#ffffff",
    text: "#1c1c1e",
    border: theme.gold.border,
    notification: theme.status.notInterested,
  },
  fonts,
};

// Tenant-driven counterpart to AppNavigationTheme above — `primary`/
// `background`/`border` come from the signed-in tenant's resolved brand
// instead of the hardcoded defaults; `card`/`text`/`notification` stay fixed.
export function buildNavigationTheme(navigation: { primary: string; background: string; border: string }): Theme {
  return {
    dark: false,
    colors: {
      primary: navigation.primary,
      background: navigation.background,
      card: "#ffffff",
      text: "#1c1c1e",
      border: navigation.border,
      notification: theme.status.notInterested,
    },
    fonts,
  };
}
