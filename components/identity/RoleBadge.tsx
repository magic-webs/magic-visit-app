import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { getRoleStyles, type StaffRole } from "@/constants/theme";

export function RoleBadge({ role }: { role: StaffRole }) {
  const style = getRoleStyles()[role];
  return (
    <View className="self-start rounded-full px-2.5 py-1" style={{ backgroundColor: `${style.color}1A` }}>
      <AppText className="font-sans-medium text-xs" style={{ color: style.color }}>
        {style.label}
      </AppText>
    </View>
  );
}
