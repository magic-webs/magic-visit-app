import { useLocalSearchParams } from "expo-router";
import { VisitorDetailContent } from "@/components/visitors/VisitorDetailContent";

export default function ManagerVisitorDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  return <VisitorDetailContent logId={logId} />;
}
