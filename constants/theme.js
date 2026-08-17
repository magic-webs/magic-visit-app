// Raw color values — the single source of truth for both Tailwind (via
// tailwind.config.js, which require()s this file) and app code (via
// constants/theme.ts, which re-exports and types these).
module.exports = {
  teal: {
    DEFAULT: "#097969",
    hover: "#0a9070",
    light: "#0bb885",
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
    primary: ["#097969", "#0a9070", "#0bb885"],
    gold: ["#fdf8ed", "#faf0d0", "#f5e8b8"],
  },
};
