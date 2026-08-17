import { View } from "react-native";
import { VisitorLogsList } from "@/components/visitors/VisitorLogsList";
import { useSession } from "@/contexts/SessionContext";

export default function ReceptionistVisitorsScreen() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <VisitorLogsList
        scope={{ type: "own-receptionist", profileId: session.profileId }}
        detailPathname="/(app)/receptionist/visitors/[logId]"
      />
    </View>
  );
}
