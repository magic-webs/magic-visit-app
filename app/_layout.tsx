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
import { View } from "react-native";
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
