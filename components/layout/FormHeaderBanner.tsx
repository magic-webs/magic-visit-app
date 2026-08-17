import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { GradientView } from "@/components/ui/GradientView";
import { AppText } from "@/components/ui/AppText";
import { useTenantConfig } from "@/contexts/TenantConfigContext";

// The gradient header for create/edit form screens — a back button, a
// title/subtitle pair, and a decorative icon badge that hints at what the
// form is for (e.g. a person-plus glyph for "Add Staff").
export function FormHeaderBanner({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon: ComponentType<{ size?: number; color?: string }>;
}) {
  const router = useRouter();
  const { brand } = useTenantConfig();

  return (
    <GradientView colors={brand.gradientPrimary} className="overflow-hidden rounded-b-3xl px-5 pb-8 pt-14">
      <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <View className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10" />
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
        >
          <ChevronLeft size={22} color="#fff" />
        </Pressable>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Icon size={22} color="#fff" />
        </View>
      </View>
      <View className="mt-4">
        <AppText className="font-sans-bold text-xl text-white">{title}</AppText>
        {subtitle && <AppText className="mt-0.5 font-sans text-white/80">{subtitle}</AppText>}
      </View>
    </GradientView>
  );
}
