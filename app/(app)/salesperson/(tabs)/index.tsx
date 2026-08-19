import { FlatList, View } from "react-native";
import { Inbox, CheckCircle2 } from "lucide-react-native";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { FadeSlideIn } from "@/components/ui/FadeSlideIn";
import { ListSkeleton, StatRowSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";
import { useSession } from "@/contexts/SessionContext";
import { theme } from "@/constants/theme";

// Accept/Decline are inline on the card (high-frequency, low-stakes), unlike the accountant's tap-through discount flow.
export default function SalespersonQueueScreen() {
  const session = useSession();
  const { data, isLoading, error } = db.useQuery(
    session.profileId
      ? ({
          visitorLogs: {
            $: { where: { "salesperson.id": session.profileId }, order: { visitedAt: "desc" } },
            customer: {},
          },
        } as any)
      : null,
  ) as { data: any; isLoading: boolean; error: any };

  async function accept(logId: string) {
    const chunks: any[] = [db.tx.visitorLogs[logId].update({ assignmentStatus: "accepted" })];
    if (session.availabilityId) {
      chunks.push(
        db.tx.salespersonAvailability[session.availabilityId].update({
          availabilityStatus: "busy",
          statusChangedAt: Date.now(),
        }),
      );
    }
    await db.transact(chunks);
  }

  async function decline(logId: string) {
    await db.transact(
      db.tx.visitorLogs[logId].update({ assignmentStatus: "unassigned" }).unlink({ salesperson: session.profileId! }),
    );
  }

  if (isLoading)
    return <ListSkeleton variant="queue-card" header={<StatRowSkeleton count={2} />} />;
  if (error) return <ErrorState message={error.message} />;

  const allLogs: any[] = data?.visitorLogs ?? [];
  const pending = allLogs.filter((l) => l.assignmentStatus === "pending_acceptance");
  const activeCount = allLogs.filter(
    (l) => l.assignmentStatus === "accepted" && !["sold", "not_interested"].includes(l.status),
  ).length;

  return (
    <FlatList
      data={pending}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 p-4"
      ListHeaderComponent={
        <FadeSlideIn style={{ marginBottom: 16 }}>
          <View className="flex-row flex-wrap gap-3">
            <StatCard icon={Inbox} value={pending.length} label="Pending" />
            <StatCard icon={CheckCircle2} value={activeCount} label="Active" color={theme.status.sold} />
          </View>
        </FadeSlideIn>
      }
      renderItem={({ item }) => (
        <View className="gap-3 rounded-2xl border border-brand-gold-border bg-white p-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <Avatar name={item.customer?.name ?? "?"} />
            <View className="flex-1">
              <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{item.customer?.name}</AppText>
              <AppText className="font-sans text-xs text-[#6b7280]">{item.customer?.mobile}</AppText>
            </View>
          </View>
          <View className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onPress={() => decline(item.id)}>
              Decline
            </Button>
            <Button className="flex-1" onPress={() => accept(item.id)}>
              Accept
            </Button>
          </View>
        </View>
      )}
      ListEmptyComponent={<EmptyState title="You're all caught up" description="No new visitors waiting for you." />}
    />
  );
}
