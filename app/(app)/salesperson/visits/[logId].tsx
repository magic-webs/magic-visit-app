import { useLocalSearchParams } from "expo-router";
import { VisitorDetailContent } from "@/components/visitors/VisitorDetailContent";

export default function SalespersonVisitWorkspaceScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  return <VisitorDetailContent logId={logId} />;
}
