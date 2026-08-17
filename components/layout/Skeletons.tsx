import { ScrollView, View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { GradientView } from "@/components/ui/GradientView";
import { theme } from "@/constants/theme";

function Repeat({ count, render }: { count: number; render: (index: number) => React.ReactNode }) {
  return <>{Array.from({ length: count }, (_, i) => render(i))}</>;
}

/** Card-style row: avatar + two lines + a trailing chip. Matches StaffList. */
export function RowCardSkeleton() {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-40" />
      </View>
      <Skeleton className="h-5 w-14 rounded-full" />
    </View>
  );
}

/** Divider row: avatar + two lines + trailing text, no card chrome. Matches
 * FollowUpQueueList / VisitorLogsList / the salesperson active-visits list. */
export function RowDividerSkeleton() {
  return (
    <View className="flex-row items-center gap-3 border-b border-[#f3f4f6] px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-36" />
      </View>
      <Skeleton className="h-4 w-12" />
    </View>
  );
}

/** Plain card: title + description lines + a footnote. Matches BranchList /
 * DiscountRequestCard (accountant queue & history). */
export function CardSkeleton() {
  return (
    <View className="gap-2 rounded-2xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </View>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3 w-32" />
    </View>
  );
}

/** Queue card: avatar row + two full-width buttons. Matches the
 * salesperson queue's Accept/Decline cards. */
export function QueueCardSkeleton() {
  return (
    <View className="gap-3 rounded-2xl border border-brand-gold-border bg-white p-4 shadow-sm">
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </View>
      </View>
      <View className="flex-row gap-2">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="h-11 flex-1 rounded-full" />
      </View>
    </View>
  );
}

/** Row of 2-3 StatCard-shaped placeholders for dashboard/queue headers. */
export function StatRowSkeleton({ count = 2 }: { count?: number }) {
  return (
    <View className="flex-row flex-wrap gap-3">
      <Repeat
        count={count}
        render={(i) => (
          <View key={i} className="grow basis-0 gap-2 rounded-2xl bg-white p-3 shadow-sm" style={{ minWidth: 96, maxWidth: 220 }}>
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-3 w-16" />
          </View>
        )}
      />
    </View>
  );
}

/** A vertical list of skeleton rows/cards, padded the same as the FlatLists
 * it stands in for. Pass `header` to also show a stat row above the list. */
export function ListSkeleton({
  variant = "row-card",
  count = 6,
  header,
}: {
  variant?: "row-card" | "row-divider" | "card" | "queue-card";
  count?: number;
  header?: React.ReactNode;
}) {
  const Item =
    variant === "row-divider" ? RowDividerSkeleton : variant === "card" ? CardSkeleton : variant === "queue-card" ? QueueCardSkeleton : RowCardSkeleton;
  const padded = variant !== "row-divider";

  return (
    <View className={padded ? "gap-3 p-4" : undefined}>
      {header}
      <Repeat count={count} render={(i) => <Item key={i} />} />
    </View>
  );
}

/** Stack of card-shaped blocks for a detail screen (profile card, a couple
 * of info cards, a button) — matches VisitorDetailContent and the discount
 * request detail screen closely enough to avoid a layout jump on load. */
export function DetailSkeleton() {
  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="gap-4 p-4" scrollEnabled={false}>
      <View className="flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Skeleton className="h-14 w-14 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </View>
      </View>
      <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </View>
      <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </View>
      <Skeleton className="h-12 w-full rounded-full" />
    </ScrollView>
  );
}

/** Gradient banner + white field card, for create/edit form screens
 * (StaffForm / BranchForm) while their initial data is still loading. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="pb-6" scrollEnabled={false}>
      <GradientView colors={theme.gradients.primary} className="overflow-hidden rounded-b-3xl px-5 pb-8 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="h-10 w-10 rounded-full bg-white/15" />
          <View className="h-12 w-12 rounded-2xl bg-white/15" />
        </View>
        <View className="mt-4 gap-2">
          <Skeleton className="h-5 w-40 bg-white/25" />
          <Skeleton className="h-3.5 w-56 bg-white/20" />
        </View>
      </GradientView>
      <View className="-mt-6 gap-4 px-4">
        <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <Repeat
            count={fields}
            render={(i) => (
              <View key={i} className="gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </View>
            )}
          />
          <Skeleton className="h-12 w-full rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
}

/** Generic full-screen skeleton for the brief moment a role gate is still
 * checking auth and hasn't picked a layout to show yet. */
export function ScreenSkeleton() {
  return (
    <View className="flex-1 bg-brand-gold-50 px-4 pt-16">
      <View className="mb-5 gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </View>
      <StatRowSkeleton count={3} />
      <View className="mt-5 gap-3">
        <Repeat count={4} render={(i) => <RowCardSkeleton key={i} />} />
      </View>
    </View>
  );
}
