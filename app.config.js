// Replaces the old static app.json. app.json is only ever read at BUILD
// time (expo prebuild / eas build) — it's a completely separate mechanism
// from the runtime tenant theme/branding fetch in
// contexts/TenantConfigContext.tsx, which only affects what's drawn on
// screen after the app is already installed. Making a per-tenant white-
// label BUILD (different app name, bundle id, icon, notification color)
// means these build-time-only fields have to come from somewhere too —
// this file reads them from env vars, defaulting to the exact values that
// were hardcoded here before, so a build with no overrides set is
// unaffected.
//
// To build a differently-branded release: set APP_NAME/APP_SLUG/APP_SCHEME/
// IOS_BUNDLE_ID/ANDROID_PACKAGE/NOTIFICATION_COLOR (e.g. as an EAS build
// profile's "env" in eas.json, or in your shell) before running
// `eas build`/`expo prebuild`. Icon/splash/adaptive-icon images still have
// to be real local files (Expo's build pipeline needs to process them) —
// point ICON_PATH/ADAPTIVE_ICON_PATH/SPLASH_ICON_PATH/FAVICON_PATH at a
// different tenant's asset files if you have them checked in locally.
//
// See scripts/sync-tenant-branding.js for an optional helper that pulls a
// tenant's current name/brand color from the panel-managed config (via the
// auth-bridge's public lookup endpoint) and writes them into .env.tenant —
// run it before building if you'd rather not hand-copy values from the
// panel every time.

const DEFAULTS = {
  // Generic default now that this is a shared, multi-tenant codebase rather
  // than a single Urmil Jewellers-specific build — set APP_NAME (e.g. per
  // EAS build profile, or via npm run sync-tenant-branding) to actually
  // brand a real tenant's build.
  name: "magic-visit-app",
  slug: "urmil-jewellers-ramnagar",
  scheme: "urmiljewellersramnagar",
  bundleId: "com.magicwebs.urmiljewellersramnagar",
  notificationColor: "#097969",
};

const APP_NAME = process.env.APP_NAME || DEFAULTS.name;
const APP_SLUG = process.env.APP_SLUG || DEFAULTS.slug;
const APP_SCHEME = process.env.APP_SCHEME || DEFAULTS.scheme;
const IOS_BUNDLE_ID = process.env.IOS_BUNDLE_ID || DEFAULTS.bundleId;
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE || DEFAULTS.bundleId;
const NOTIFICATION_COLOR = process.env.NOTIFICATION_COLOR || DEFAULTS.notificationColor;

const ICON_PATH = process.env.ICON_PATH || "./assets/images/icon.png";
const ADAPTIVE_ICON_PATH = process.env.ADAPTIVE_ICON_PATH || "./assets/images/adaptive-icon.png";
const SPLASH_ICON_PATH = process.env.SPLASH_ICON_PATH || "./assets/images/splash-icon.png";
const FAVICON_PATH = process.env.FAVICON_PATH || "./assets/images/favicon.png";

module.exports = ({ config }) => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  version: "1.0.0",
  orientation: "portrait",
  icon: ICON_PATH,
  scheme: APP_SCHEME,
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: IOS_BUNDLE_ID,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: ADAPTIVE_ICON_PATH,
      backgroundColor: "#ffffff",
    },
    package: ANDROID_PACKAGE,
    googleServicesFile: "./google-services.json",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: FAVICON_PATH,
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: SPLASH_ICON_PATH,
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-font",
    "expo-image",
    "expo-status-bar",
    "expo-web-browser",
    [
      "expo-notifications",
      {
        icon: ICON_PATH,
        color: NOTIFICATION_COLOR,
        sounds: ["./assets/sounds/notification.wav"],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "a632e0c4-6902-4d37-a9ad-f8d6c2089102",
    },
  },
});
