import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { AppText } from "@/components/ui/AppText";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";

export interface FollowUpScope {
  type: "branch" | "own-receptionist" | "own-salesperson";
  branchId?: string;
  profileId?: string;
}

// Sorted by earliest followUpDate first; taps reuse the VisitorDetailContent detail screen (already has reschedule/remark UI) instead of a duplicate sheet component.
export function FollowUpQueueList({ scope, detailPathname }: { scope: FollowUpScope; detailPathname: string }) {
  const router = useRouter();
  const where: Record<string, any> = { followUpDate: { $isNull: false } };
  if (scope.type === "branch" && scope.branchId) where["branch.id"] = scope.branchId;
  if (scope.type === "own-receptionist" && scope.profileId) where["receptionist.id"] = scope.profileId;
  if (scope.type === "own-salesperson" && scope.profileId) where["salesperson.id"] = scope.profileId;

  const canQuery = Boolean(scope.branchId || scope.profileId);
  const { data, isLoading, error } = db.useQuery(
    canQuery
      ? ({
          visitorLogs: {
            $: { where, order: { followUpDate: "asc" } },
            customer: {},
            salesperson: {},
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
          onPress={() => router.push({ pathname: detailPathname as any, params: { logId: item.id } })}
          className="flex-row items-center gap-3 border-b border-[#f3f4f6] px-4 py-3"
        >
          <Avatar name={item.customer?.name ?? "?"} />
          <View className="flex-1">
            <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{item.customer?.name}</AppText>
            <AppText className="font-sans text-xs text-[#6b7280]">{item.customer?.mobile}</AppText>
            {item.salesperson?.name && (
              <AppText className="font-sans text-xs text-[#9ca3af]">Assigned: {item.salesperson.name}</AppText>
            )}
          </View>
          <AppText className="font-sans-medium text-xs text-brand-teal">
            {new Date(item.followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </AppText>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState title="All caught up!" description="No follow-ups scheduled." />}
    />
  );
}
