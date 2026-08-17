import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { AVAILABILITY_STYLES, type AvailabilityStatus } from "@/constants/theme";

export function AvailabilityDot({
  status,
  showLabel,
  className,
}: {
  status: AvailabilityStatus;
  showLabel?: boolean;
  className?: string;
}) {
  const style = AVAILABILITY_STYLES[status];
  return (
    <View className={cn("flex-row items-center gap-1.5", className)}>
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: style.color }} />
      {showLabel && <AppText className="font-sans-medium text-xs text-[#4b5563]">{style.label}</AppText>}
    </View>
  );
}
