import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { parseOklch, oklchToHex } from "@/lib/theme/oklch";
import { base64ToUtf8 } from "@/lib/base64";

// +html.tsx is only ever evaluated once, server-side, during `expo export -p
// web`'s static HTML generation (see
// https://docs.expo.dev/router/reference/static-rendering/#root-html) — it
// never re-renders client-side, so reading EXPO_PUBLIC_BAKED_TENANT_CONFIG
// (baked in by scripts/sync-tenant-branding.js, same value
// contexts/TenantConfigContext.tsx decodes at runtime) here gives this
// shell the tenant's real app name/theme color instead of the hardcoded
// default. The favicon/apple-touch-icon hrefs stay fixed paths —
// sync-tenant-branding.js overwrites the actual files at those paths
// (public/favicon.png, public/icon-512.png) with the tenant's icon, so the
// static filename is right and the bytes it serves are the tenant's, not
// Expo's manifest field for this (which the static export doesn't consult
// at all).
function readBakedConfig(): { appName?: string; shortName?: string; themeColor?: string } {
  const encoded = process.env.EXPO_PUBLIC_BAKED_TENANT_CONFIG;
  if (!encoded) return {};
  try {
    const data = JSON.parse(base64ToUtf8(encoded));
    const primary = data?.theme?.light?.primary;
    return {
      appName: data?.branding?.appName,
      shortName: data?.branding?.shortName,
      themeColor: primary ? oklchToHex(parseOklch(primary)) : undefined,
    };
  } catch {
    return {};
  }
}

// Expo Router's default root HTML document for the web build, with PWA tags
// added: a manifest link + icons so the app is installable ("Add to Home
// Screen" / desktop install), and theme-color/status-bar meta so the
// installed window matches the tenant's own branding instead of a default
// browser chrome color.
export default function Root({ children }: PropsWithChildren) {
  const baked = readBakedConfig();
  const appName = baked.appName || "magic-visit-app";
  const shortName = baked.shortName || appName;
  const themeColor = baked.themeColor || "#097969";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>{appName}</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <meta name="theme-color" content={themeColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={shortName} />

        {/* Disabling `overflow: hidden` on `body`/`html` breaks Android/iOS
            scroll momentum on native, but web needs its own scroll
            behavior, so this is web-only — same reasoning as Expo's own
            default template. */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
