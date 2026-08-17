import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Expo Router's default root HTML document for the web build (see
// https://docs.expo.dev/router/reference/static-rendering/#root-html), with
// PWA tags added: a manifest link + icons so the app is installable
// ("Add to Home Screen" / desktop install), and theme-color/status-bar
// meta so the installed window matches the app's own teal branding instead
// of a default browser chrome color.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>magic-visit-app</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <meta name="theme-color" content="#097969" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="magic-visit-app" />

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
