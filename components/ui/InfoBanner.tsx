import type { ComponentType } from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { theme } from "@/constants/theme";

// A mint/light-teal info card used above forms to explain what happens next
// (e.g. "the new staff member gets instant access based on their role").
export function InfoBanner({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row gap-3 rounded-2xl border border-brand-teal/15 bg-brand-teal/10 p-4">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-white">
        <Icon size={18} color={theme.teal.DEFAULT} />
      </View>
      <View className="flex-1">
        <AppText className="font-sans-semibold text-sm text-[#0d5c4f]">{title}</AppText>
        <AppText className="mt-0.5 font-sans text-xs text-[#0d5c4f]/80">{description}</AppText>
      </View>
    </View>
  );
}
