const theme = require("./constants/theme.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Tenant-themeable brand colors — resolved at runtime via
        // NativeWind's vars() (see contexts/TenantConfigContext.tsx +
        // app/_layout.tsx), not hardcoded hex. The `rgb(var(--x) /
        // <alpha-value>)` form is what lets `bg-brand-teal/50`-style
        // opacity modifiers keep working. `status`/`availability` stay
        // fixed literal hex below — those are semantic (green = sold),
        // never tenant-branded.
        brand: {
          teal: {
            DEFAULT: "rgb(var(--color-brand-teal) / <alpha-value>)",
            hover: "rgb(var(--color-brand-teal-hover) / <alpha-value>)",
            light: "rgb(var(--color-brand-teal-light) / <alpha-value>)",
          },
          gold: {
            50: "rgb(var(--color-brand-gold-50) / <alpha-value>)",
            100: "rgb(var(--color-brand-gold-100) / <alpha-value>)",
            200: "rgb(var(--color-brand-gold-200) / <alpha-value>)",
            border: "rgb(var(--color-brand-gold-border) / <alpha-value>)",
          },
        },
        status: theme.status,
        availability: theme.availability,
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
