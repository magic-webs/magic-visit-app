import type { ReactNode } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { useTenantConfig } from "@/contexts/TenantConfigContext";

// Paired with LiquidTabBar as the tab-shell chrome; mounted once per role in each (tabs)/_layout.tsx.
export function AppHeader({
  subtitle,
  branchName,
  right,
}: {
  subtitle: string;
  branchName?: string;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { branding } = useTenantConfig();
  return (
    <View
      className="flex-row items-center justify-between border-b border-brand-gold-border bg-white px-5 pb-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center gap-2.5">
        <Image
          source={branding.logoLightUrl ? { uri: branding.logoLightUrl } : require("@/assets/images/logo.png")}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
        <View>
          <AppText className="font-sans-bold text-base text-brand-teal">{branding.appName}</AppText>
          <AppText className="font-sans text-xs text-[#6b7280]">{subtitle}</AppText>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        {branchName && (
          <View className="rounded-full bg-brand-gold-100 px-2.5 py-1">
            <AppText className="font-sans-medium text-xs text-brand-teal">{branchName}</AppText>
          </View>
        )}
        {right}
      </View>
    </View>
  );
}
