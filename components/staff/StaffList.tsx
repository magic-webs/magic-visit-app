import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { RoleBadge } from "@/components/identity/RoleBadge";
import { AvailabilityDot } from "@/components/identity/AvailabilityDot";
import { AppText } from "@/components/ui/AppText";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";
import type { StaffRole } from "@/constants/theme";

export function StaffList({
  branchId,
  roles,
  editPathname,
}: {
  /** undefined = all branches (owner scope) */
  branchId?: string;
  /** restrict which roles show up — e.g. manager's screen excludes itself */
  roles?: StaffRole[];
  editPathname: string;
}) {
  const router = useRouter();
  const where: Record<string, any> = {};
  if (branchId) where["branch.id"] = branchId;
  if (roles?.length) where.role = { $in: roles };

  const { data, isLoading, error } = db.useQuery({
    profiles: {
      $: { where, order: { createdAt: "desc" } },
      branch: {},
      availability: {},
    },
  } as any) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <ListSkeleton variant="row-card" />;
  if (error) return <ErrorState message={error.message} />;

  const staff = (data?.profiles as any[]) ?? [];

  return (
    <FlatList
      data={staff}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 p-4 pb-48"
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: editPathname as any, params: { staffId: item.id } })}
          className="flex-row items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
        >
          <Avatar name={item.name} />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{item.name}</AppText>
              {!item.active && <AppText className="font-sans text-xs text-status-notInterested">Inactive</AppText>}
            </View>
            <AppText className="font-sans text-xs text-[#6b7280]">
              {item.mobile} · {item.branch?.name ?? "No branch"}
            </AppText>
          </View>
          <View className="items-end gap-1">
            <RoleBadge role={item.role as StaffRole} />
            {item.role === "salesperson" && (
              <AvailabilityDot status={item.availability?.availabilityStatus ?? "offline"} showLabel />
            )}
          </View>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState title="No staff yet" description="Add your first staff member to get started." />}
    />
  );
}
