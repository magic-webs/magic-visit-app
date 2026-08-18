import "../global.css";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
// As of SDK 56, expo-router vendors its own ThemeProvider — importing from
// @react-navigation/native directly trips a hard compatibility guard.
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { vars } from "nativewind";
import "react-native-reanimated";

import { buildNavigationTheme } from "@/constants/theme";
import { SessionProvider } from "@/contexts/SessionContext";
import { ConfirmModalProvider } from "@/contexts/ConfirmModalContext";
import { TenantConfigProvider, useTenantConfig } from "@/contexts/TenantConfigContext";
import { NotificationRouter } from "@/components/layout/NotificationRouter";

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TenantConfigProvider>
      <ThemedRoot />
    </TenantConfigProvider>
  );
}

// Split out so it can call useTenantConfig() — needs to be inside
// TenantConfigProvider, which itself has to wrap everything (including the
// login screen, which needs the tenant's logo/name before anyone signs in).
function ThemedRoot() {
  const { brand } = useTenantConfig();

  // Web only — `theme.font` (see lib/theme/presets.ts's FONT_OPTIONS in the
  // panel) is a CSS font stack, not a real React Native font family name,
  // so it can only be honored on the web build; native font selection
  // would need actual bundled font files per choice, which isn't built
  // yet. `!important` + a broad selector is deliberate: NativeWind compiles
  // `font-sans`/`font-sans-medium`/etc. into their own font-family
  // declarations with normal specificity, and this has to reliably beat
  // all of them, not just set an inherited default that they'd override.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-tenant-font", "true");
    styleEl.textContent = `html, body, [class*="font-sans"] { font-family: ${brand.fontFamily} !important; }`;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, [brand.fontFamily]);

  return (
    // `vars(...)` turns the resolved brand colors into CSS custom properties
    // that every `bg-brand-teal`/`text-brand-teal`/etc. Tailwind class below
    // this View resolves against (see tailwind.config.js) — this is what
    // makes the whole app's brand color re-skin per tenant without having
    // to touch every screen that uses those classes.
    <View style={[{ flex: 1 }, vars(brand.vars)]}>
      <ThemeProvider value={buildNavigationTheme(brand.navigation)}>
        <SessionProvider>
          <ConfirmModalProvider>
            <NotificationRouter />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
          </ConfirmModalProvider>
        </SessionProvider>
      </ThemeProvider>
    </View>
  );
}
