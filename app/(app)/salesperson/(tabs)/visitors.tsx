import { View } from "react-native";
import { VisitorLogsList } from "@/components/visitors/VisitorLogsList";
import { useSession } from "@/contexts/SessionContext";

// The salesperson's full handled-visitors history (all statuses, not just
// still-open ones — see active.tsx for the unresolved-only view).
export default function SalespersonVisitorsScreen() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <VisitorLogsList
        scope={{ type: "own-salesperson", profileId: session.profileId }}
        detailPathname="/(app)/salesperson/visits/[logId]"
      />
    </View>
  );
}
