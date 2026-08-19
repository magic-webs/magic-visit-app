import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { parseOklch, oklchToHex } from "@/lib/theme/oklch";
import { base64ToUtf8 } from "@/lib/base64";

// Runs once at static export time (never re-renders client-side), so read the tenant config
// scripts/sync-tenant-branding.js baked in; that script also overwrites the favicon/icon files in place, so the fixed hrefs below always serve the tenant's icon.
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

// Default root HTML doc plus PWA tags (manifest/icons for installability, theme-color meta for tenant branding).
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

        {/* Web-only scroll reset; native handles scroll momentum differently (matches Expo's default template). */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
