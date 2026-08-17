import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { AppText } from "@/components/ui/AppText";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";
import { useSession } from "@/contexts/SessionContext";
import type { VisitorStatus } from "@/constants/theme";

export default function SalespersonActiveScreen() {
  const session = useSession();
  const router = useRouter();
  const { data, isLoading, error } = db.useQuery(
    session.profileId
      ? ({
          visitorLogs: {
            $: {
              where: {
                "salesperson.id": session.profileId,
                assignmentStatus: "accepted",
                status: { $in: ["none", "window_shopping", "follow_up", "not_available"] },
              },
              order: { visitedAt: "desc" },
            },
            customer: {},
          },
        } as any)
      : null,
  ) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <ListSkeleton variant="row-divider" />;
  if (error) return <ErrorState message={error.message} />;

  const logs = (data?.visitorLogs as any[]) ?? [];

  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/(app)/salesperson/visits/[logId]", params: { logId: item.id } })}
          className="flex-row items-center gap-3 border-b border-[#f3f4f6] px-4 py-3"
        >
          <Avatar name={item.customer?.name ?? "?"} />
          <View className="flex-1">
            <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{item.customer?.name}</AppText>
            <AppText className="font-sans text-xs text-[#6b7280]">{item.customer?.mobile}</AppText>
          </View>
          <StatusBadge status={item.status as VisitorStatus} />
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState title="No active visits" description="Accept a visitor from your Queue to get started." />
      }
    />
  );
}
