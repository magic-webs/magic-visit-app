import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";

export function TipBanner({
  icon: Icon,
  title,
  description,
  actionLabel,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-brand-gold-border bg-brand-gold-50 p-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
        <Icon size={20} color={theme.teal.hover} />
      </View>
      <View className="flex-1">
        <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{title}</AppText>
        <AppText className="mt-0.5 font-sans text-xs text-[#6b7280]">{description}</AppText>
      </View>
      <View className="flex-row items-center rounded-full bg-white px-3 py-2">
        <AppText className="font-sans-medium text-xs text-brand-teal">{actionLabel}</AppText>
        <ChevronRight size={14} color={theme.teal.DEFAULT} />
      </View>
    </Pressable>
  );
}
