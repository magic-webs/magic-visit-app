import type { ComponentType } from "react";
import { Switch, View } from "react-native";
import { AppText } from "./AppText";
import { theme } from "@/constants/theme";

export function SwitchRow({
  label,
  description,
  value,
  onValueChange,
  icon: Icon,
  color = theme.teal.DEFAULT,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Leading icon badge, e.g. a calendar glyph for a follow-up toggle. */
  icon?: ComponentType<{ size?: number; color?: string }>;
  color?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-1">
      <View className="flex-1 flex-row items-center gap-3">
        {Icon && (
          <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
            <Icon size={18} color={color} />
          </View>
        )}
        <View className="flex-1">
          <AppText className="font-sans-medium text-sm text-[#1c1c1e]">{label}</AppText>
          {description && <AppText className="mt-0.5 font-sans text-xs text-[#6b7280]">{description}</AppText>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#d1d5db", true: theme.teal.light }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
