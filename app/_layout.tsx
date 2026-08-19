import "../global.css";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
// SDK 56: expo-router vendors its own ThemeProvider; importing from @react-navigation/native directly trips a compatibility guard.
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

// Split out so it can call useTenantConfig(), which must wrap everything including the (pre-login) login screen.
function ThemedRoot() {
  const { brand } = useTenantConfig();

  // Web-only: theme.font is a CSS stack, not a native font family; !important is needed to beat NativeWind's own font-sans-* rules.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-tenant-font", "true");
    styleEl.textContent = `html, body, [class*="font-sans"] { font-family: ${brand.fontFamily} !important; }`;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, [brand.fontFamily]);

  return (
    // vars(brand.vars) exposes brand colors as CSS custom properties so bg-brand-teal/etc. classes re-skin per tenant with no per-screen changes.
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
