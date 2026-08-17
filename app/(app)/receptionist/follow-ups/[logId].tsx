import { useLocalSearchParams } from "expo-router";
import { VisitorDetailContent } from "@/components/visitors/VisitorDetailContent";

export default function ReceptionistFollowUpDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  return <VisitorDetailContent logId={logId} />;
}
