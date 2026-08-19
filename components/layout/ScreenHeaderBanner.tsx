import type { ReactNode } from "react";
import { View } from "react-native";
import { GradientView } from "@/components/ui/GradientView";
import { AppText } from "@/components/ui/AppText";
import { useTenantConfig } from "@/contexts/TenantConfigContext";

// Reused across every dashboard/list screen in the source app.
export function ScreenHeaderBanner({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { brand } = useTenantConfig();
  return (
    <GradientView colors={brand.gradientPrimary} className="overflow-hidden rounded-b-3xl px-6 pb-6 pt-14">
      <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <View className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10" />
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <AppText className="font-sans-bold text-xl text-white">{title}</AppText>
          {subtitle && <AppText className="mt-0.5 font-sans text-white/80">{subtitle}</AppText>}
        </View>
        {right}
      </View>
    </GradientView>
  );
}
