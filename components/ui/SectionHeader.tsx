import type { ComponentType } from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { theme } from "@/constants/theme";

/** Icon badge + bold title (+ optional subtitle) header row shown above a card's content. */
export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = theme.teal.DEFAULT,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
        <Icon size={18} color={color} />
      </View>
      <View className="flex-1">
        <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{title}</AppText>
        {subtitle && <AppText className="mt-0.5 font-sans text-xs text-[#6b7280]">{subtitle}</AppText>}
      </View>
    </View>
  );
}
