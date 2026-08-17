import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";

export function PerformanceDot({ color, points, label }: { color?: string | null; points?: number | null; label?: string | null }) {
  if (!color) return null;
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {(points !== null && points !== undefined) || label ? (
        <AppText className="font-sans text-xs text-[#6b7280]">
          {label}
          {label && points !== null && points !== undefined ? " · " : ""}
          {points !== null && points !== undefined ? `${points} pts` : ""}
        </AppText>
      ) : null}
    </View>
  );
}
