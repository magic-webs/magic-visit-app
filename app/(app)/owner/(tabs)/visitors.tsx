import { View } from "react-native";
import { VisitorLogsList } from "@/components/visitors/VisitorLogsList";

export default function OwnerVisitorsScreen() {
  return (
    <View className="flex-1 bg-brand-gold-50">
      <VisitorLogsList scope={{ type: "all" }} detailPathname="/(app)/owner/visitors/[logId]" />
    </View>
  );
}
