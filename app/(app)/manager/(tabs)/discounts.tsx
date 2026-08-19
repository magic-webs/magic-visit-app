import { FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Crown } from "lucide-react-native";
import { db } from "@/lib/db";
import { DiscountRequestCard } from "@/components/discounts/DiscountRequestCard";
import { Button } from "@/components/ui/Button";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";

// instant.perms.ts already scopes discountRequests to the manager's own branch — no explicit filter needed here.
export default function ManagerDiscountsScreen() {
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
      ListHeaderComponent={
        <Button
          variant="outline"
          icon={Crown}
          className="mb-3"
          onPress={() => router.push("/(app)/manager/prime-members")}
        >
          Manage Prime Members
        </Button>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/(app)/manager/discounts/[discountId]", params: { discountId: item.id } })}
        >
          <DiscountRequestCard request={item} />
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState title="No discounts yet" description="Accountant-initiated discounts will show up here." />}
    />
  );
}
