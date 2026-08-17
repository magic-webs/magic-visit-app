import { View } from "react-native";
import { FollowUpQueueList } from "@/components/follow-ups/FollowUpQueueList";
import { useSession } from "@/contexts/SessionContext";

export default function ManagerFollowUpsScreen() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <FollowUpQueueList
        scope={{ type: "branch", branchId: session.branchId }}
        detailPathname="/(app)/manager/follow-ups/[logId]"
      />
    </View>
  );
}
