import { FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { db } from "@/lib/db";
import { DiscountRequestCard } from "@/components/discounts/DiscountRequestCard";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";

// Branch-wide history (not just this accountant's own) — any accountant in
// the branch can see what's pending/applied/cancelled/locked for reconciliation.
export default function AccountantHistoryScreen() {
  const router = useRouter();
  const { data, isLoading, error } = db.useQuery({
    discountRequests: {
      $: { order: { createdAt: "desc" } },
      visitorLog: { customer: {} },
      accountant: {},
    },
  } as any) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <ListSkeleton variant="card" />;
  if (error) return <ErrorState message={error.message} />;

  const requests = (data?.discountRequests as any[]) ?? [];

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 p-4"
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/(app)/accountant/discounts/[discountId]", params: { discountId: item.id } })}
        >
          <DiscountRequestCard request={item} />
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState title="No discounts yet" description="Discounts you apply will show up here." />}
    />
  );
}
