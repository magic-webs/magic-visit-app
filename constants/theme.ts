import type { Theme } from "expo-router";

// Raw values are also defined in ./theme.js (tailwind.config.js requires
// that CJS file directly — mixing that with a TS import here ran into
// CommonJS/ESM interop issues under allowJs, so the small, static palette is
// just restated natively here instead of fighting that).
export const theme = {
  teal: {
    DEFAULT: "#097969",
    hover: "#0a9070",
    light: "#0bb885",
    // The 3D-lip color behind a primary Button's face (see
    // components/ui/Button.tsx) — mutated in place by
    // applyResolvedBrandColors() below, same as the other teal shades.
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
    // A mutable (not `as const`) 3-tuple — still shaped like a tuple (so
    // GradientView's `colors` prop, which requires at least 2 elements,
    // still type-checks) but with elements applyResolvedBrandColors() below
    // can reassign in place once a tenant's theme resolves.
    primary: ["#097969", "#0a9070", "#0bb885"] as [string, string, string],
    gold: ["#fdf8ed", "#faf0d0", "#f5e8b8"] as const,
  },
};

// `theme.teal`/`theme.gradients.primary` are read directly (not through a
// Tailwind class) by ~25 files across the app — icon tints, FAB backgrounds,
// tab-bar active color, activity indicators, skeleton banners, and more —
// places a CSS-variable-based fix (see tailwind.config.js) can't reach,
// since those are plain object-property reads, not `className` strings.
// Rather than hand-edit every one of those call sites, this function
// mutates the shared `theme` object in place once the tenant's resolved
// brand is known (see contexts/TenantConfigContext.tsx) — every consumer
// re-reads `theme.teal.DEFAULT` fresh on its next render, so they all pick
// up the new color for free. This makes `theme` a mutable, tenant-aware
// singleton rather than a pure constant; a deliberate, contained trade-off
// given how broadly it's imported by direct property access rather than via
// props/hooks. For today's single migrated tenant this is a no-op (the
// resolved brand starts out equal to these same hardcoded values).
//
// Crucial caveat this mutation trick does NOT cover: anything that reads
// `theme.teal.*`/`theme.gold.*` into a plain object *at module load time*
// (e.g. a top-level `const X = { color: theme.teal.DEFAULT }`) captures
// today's string value once and never sees later mutations — only a read
// that happens fresh inside a function body (a render, or a function called
// per-render) stays live. ROLE_STYLES below is built this way — as a
// function, not a frozen object — specifically to avoid that trap; see its
// own comment.
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

// A function, not a frozen top-level object — `owner`/`branch_manager`/
// `accountant` reference the mutable `theme.teal`/`theme.gold` shades (see
// applyResolvedBrandColors' comment above on why a plain object here would
// permanently freeze in whatever tenant happened to be active at module
// load, usually the hardcoded default). Called fresh inside each consumer's
// render (see components/identity/RoleBadge.tsx) so it always reflects the
// signed-in tenant's current brand.
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

// Tenant-driven counterpart to the static AppNavigationTheme above — same
// shape, but `primary`/`background`/`border` come from the signed-in
// tenant's resolved brand (see contexts/TenantConfigContext.tsx) instead of
// the hardcoded Urmil Jewellers values. `card`/`text`/`notification` stay
// fixed regardless of tenant, same as AppNavigationTheme.
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
