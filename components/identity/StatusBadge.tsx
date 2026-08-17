import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { STATUS_STYLES, type VisitorStatus } from "@/constants/theme";

export function StatusBadge({ status }: { status: VisitorStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full bg-black/5 px-2.5 py-1">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
      <AppText className="font-sans-medium text-xs" style={{ color: style.color }}>
        {style.label}
      </AppText>
    </View>
  );
}
