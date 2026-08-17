import { View } from "react-native";
import { FollowUpQueueList } from "@/components/follow-ups/FollowUpQueueList";
import { useSession } from "@/contexts/SessionContext";

export default function ReceptionistFollowUpsScreen() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <FollowUpQueueList
        scope={{ type: "own-receptionist", profileId: session.profileId }}
        detailPathname="/(app)/receptionist/follow-ups/[logId]"
      />
    </View>
  );
}
