import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { ArrowUp, ArrowDown } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";

export interface StatTrend {
  direction: "up" | "down" | "flat";
  percent: number;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  color = theme.teal.DEFAULT,
  trend,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  value: number | string;
  label: string;
  color?: string;
  trend?: StatTrend;
  /** Makes the card tappable, e.g. to jump to the list it's summarizing. */
  onPress?: () => void;
}) {
  const trendColor =
    trend?.direction === "up" ? theme.status.sold : trend?.direction === "down" ? theme.status.notInterested : "#9ca3af";

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      className="grow basis-0 gap-2 rounded-2xl bg-white p-3 shadow-sm"
      style={{ minWidth: 96, maxWidth: 220 }}
    >
      <View className="h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
        <Icon size={16} color={color} />
      </View>
      <AppText className="font-sans-bold text-xl text-[#1c1c1e]" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText className="font-sans text-xs text-[#6b7280]" numberOfLines={2}>
        {label}
      </AppText>
      {trend && (
        <View className="mt-1 flex-row flex-wrap items-center gap-1 border-t border-[#f3f4f6] pt-2">
          {trend.direction === "down" ? (
            <ArrowDown size={12} color={trendColor} />
          ) : (
            <ArrowUp size={12} color={trendColor} />
          )}
          <AppText className="font-sans-medium text-[11px]" style={{ color: trendColor }}>
            {trend.percent}%
          </AppText>
          <AppText className="font-sans text-[11px] text-[#9ca3af]" numberOfLines={1}>
            vs yesterday
          </AppText>
        </View>
      )}
    </Container>
  );
}
