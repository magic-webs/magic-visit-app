import { View } from "react-native";
import { VisitorLogsList } from "@/components/visitors/VisitorLogsList";
import { useSession } from "@/contexts/SessionContext";

export default function ManagerVisitorsScreen() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <VisitorLogsList
        scope={{ type: "branch", branchId: session.branchId }}
        detailPathname="/(app)/manager/visitors/[logId]"
      />
    </View>
  );
}
