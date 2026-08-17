import { View } from "react-native";
import { Calendar, Gem } from "lucide-react-native";
import { GradientView } from "@/components/ui/GradientView";
import { AppText } from "@/components/ui/AppText";
import { useTenantConfig } from "@/contexts/TenantConfigContext";

// A richer greeting banner than the plain ScreenHeaderBanner (used by the
// other roles' simpler dashboards) — wave emoji, a supporting line, a
// today's-date pill, and a large low-opacity Gem as a decorative accent in
// place of a jewelry photo (no image asset available for this).
export function DashboardHeroBanner({ name }: { name: string }) {
  const { brand } = useTenantConfig();
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <GradientView colors={brand.gradientPrimary} className="overflow-hidden rounded-b-3xl px-6 pb-6 pt-14">
      <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <View className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10" />
      <Gem
        size={160}
        color="#fff"
        strokeWidth={1}
        style={{ position: "absolute", right: -30, top: 30, opacity: 0.12 }}
      />

      <AppText className="font-sans-bold text-2xl text-white">Hi, {name}! 👋</AppText>
      <AppText className="mt-1 font-sans text-white/80">Here&apos;s what&apos;s happening with your business today.</AppText>

      <View className="mt-4 h-px bg-white/20" />

      <View className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-white/15 px-3 py-2">
        <Calendar size={14} color="#fff" />
        <AppText className="font-sans-medium text-xs text-white">{dateLabel}</AppText>
      </View>
    </GradientView>
  );
}
