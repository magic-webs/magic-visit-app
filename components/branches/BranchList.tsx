import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { db } from "@/lib/db";
import { AppText } from "@/components/ui/AppText";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";

export function BranchList() {
  const router = useRouter();
  const { data, isLoading, error } = db.useQuery({
    branches: { $: { order: { createdAt: "desc" } }, staff: {} },
  } as any) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <ListSkeleton variant="card" />;
  if (error) return <ErrorState message={error.message} />;

  const branches = (data?.branches as any[]) ?? [];

  return (
    <FlatList
      data={branches}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 p-4 pb-48"
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/(app)/owner/branches/[branchId]", params: { branchId: item.id } })}
          className="gap-1 rounded-2xl bg-white p-4 shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{item.name}</AppText>
            {!item.active && <AppText className="font-sans text-xs text-status-notInterested">Inactive</AppText>}
          </View>
          <AppText className="font-sans text-sm text-[#6b7280]">{item.location}</AppText>
          <AppText className="font-sans text-xs text-[#9ca3af]">{(item.staff ?? []).length} staff</AppText>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState title="No branches yet" description="Add your first branch to get started." />}
    />
  );
}
