import { useState } from "react";
import { FlatList, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SlidersHorizontal, X } from "lucide-react-native";
import { VisitorFilterChips } from "./VisitorFilterChips";
import { VisitorLogRow } from "./VisitorLogRow";
import { ListSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { EmptyState } from "@/components/layout/EmptyState";
import { useVisitorLogsQuery, type VisitorLogsScope, type DateFilter } from "@/hooks/useVisitorLogsQuery";
import { AppText } from "@/components/ui/AppText";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { STATUS_STYLES, type VisitorStatus } from "@/constants/theme";

// The VisitorLogsTable equivalent — the List/Table density toggle from the
// web app is dropped in favor of a single, comfortable list row (a literal
// HTML-style table doesn't translate to a phone-width screen).
export function VisitorLogsList({
  scope,
  detailPathname,
}: {
  scope: VisitorLogsScope;
  /** Dynamic route pathname for the detail screen, e.g. "/(app)/receptionist/visitors/[logId]" */
  detailPathname: string;
}) {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<VisitorStatus | undefined>();
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  const [hAndMFilter, setHAndMFilter] = useState<string | undefined>();
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  const { deduped, isLoading, error } = useVisitorLogsQuery(scope, {
    dateFilter,
    status: statusFilter,
    gender: genderFilter,
    hAndM: hAndMFilter,
  });

  const hasActiveFilters = Boolean(statusFilter || genderFilter || hAndMFilter);

  function resetFilters() {
    setStatusFilter(undefined);
    setGenderFilter(undefined);
    setHAndMFilter(undefined);
  }

  // The filter chips must stay mounted regardless of loading/error state —
  // InstantDB's isLoading flips back to true on every filter change (new
  // query shape = new subscription), so gating the whole screen on it would
  // tear out the chips themselves each time you tap one.
  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-3 gap-2">
        <View className="flex-1">
          <VisitorFilterChips value={dateFilter} onChange={setDateFilter} />
        </View>
        <Pressable
          onPress={() => setIsFilterSheetVisible(true)}
          className={cn(
            "h-10 w-10 items-center justify-center rounded-full border",
            hasActiveFilters
              ? "border-brand-teal bg-brand-teal"
              : "border-brand-gold-border bg-white"
          )}
        >
          <SlidersHorizontal size={16} color={hasActiveFilters ? "#fff" : "#4b5563"} />
        </Pressable>
      </View>

      {hasActiveFilters && (
        <View className="flex-row flex-wrap items-center gap-1.5 px-4 pb-3">
          <AppText className="font-sans text-xs text-[#9ca3af]">Filters:</AppText>
          {statusFilter && (
            <View className="flex-row items-center gap-1 rounded-full bg-brand-gold-100 px-2.5 py-1">
              <AppText className="font-sans-medium text-[11px] text-[#4b5563]">
                Status: {STATUS_STYLES[statusFilter]?.label ?? statusFilter}
              </AppText>
              <Pressable onPress={() => setStatusFilter(undefined)}>
                <X size={10} color="#6b7280" />
              </Pressable>
            </View>
          )}
          {genderFilter && (
            <View className="flex-row items-center gap-1 rounded-full bg-brand-gold-100 px-2.5 py-1">
              <AppText className="font-sans-medium text-[11px] text-[#4b5563]">
                Gender: {genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}
              </AppText>
              <Pressable onPress={() => setGenderFilter(undefined)}>
                <X size={10} color="#6b7280" />
              </Pressable>
            </View>
          )}
          {hAndMFilter && (
            <View className="flex-row items-center gap-1 rounded-full bg-brand-gold-100 px-2.5 py-1">
              <AppText className="font-sans-medium text-[11px] text-[#4b5563]">
                H&M: {hAndMFilter === "other" ? "Other" : hAndMFilter}
              </AppText>
              <Pressable onPress={() => setHAndMFilter(undefined)}>
                <X size={10} color="#6b7280" />
              </Pressable>
            </View>
          )}
          <Pressable onPress={resetFilters}>
            <AppText className="font-sans-semibold text-xs text-brand-teal ml-1">Clear All</AppText>
          </Pressable>
        </View>
      )}

      {!isLoading && !error && (
        <View className="px-4 pb-2">
          <AppText className="font-sans-semibold text-sm text-[#4b5563]">
            Total Visitors: <AppText className="text-brand-teal">{deduped.length}</AppText>
          </AppText>
        </View>
      )}

      {isLoading ? (
        <ListSkeleton variant="row-divider" />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : (
        <FlatList
          data={deduped}
          contentContainerClassName="pb-48"
          keyExtractor={(item) => item.latest.customer?.id ?? item.latest.id}
          renderItem={({ item }) => (
            <VisitorLogRow
              entry={item}
              onPress={() => router.push({ pathname: detailPathname as any, params: { logId: item.latest.id } })}
            />
          )}
          ListEmptyComponent={<EmptyState title="No visitors found" description="Try a different filter." />}
        />
      )}

      <BottomSheet
        visible={isFilterSheetVisible}
        onClose={() => setIsFilterSheetVisible(false)}
        title="Filter Visitors"
      >
        <View className="gap-6 p-5">
          {/* Status Section */}
          <View className="gap-2">
            <AppText className="font-sans-semibold text-xs text-[#4b5563] uppercase tracking-wider">Visitor Status</AppText>
            <View className="flex-row flex-wrap gap-2">
              {Object.entries(STATUS_STYLES)
                .filter(([key]) => key !== "none")
                .map(([key, style]) => {
                  const isActive = statusFilter === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setStatusFilter(isActive ? undefined : (key as VisitorStatus))}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5",
                        isActive ? "border-brand-teal bg-brand-teal" : "border-brand-gold-border bg-white"
                      )}
                    >
                      <AppText className={cn("font-sans-medium text-xs", isActive ? "text-white" : "text-[#4b5563]")}>
                        {style.label}
                      </AppText>
                    </Pressable>
                  );
                })}
            </View>
          </View>

          {/* Gender Section */}
          <View className="gap-2">
            <AppText className="font-sans-semibold text-xs text-[#4b5563] uppercase tracking-wider">Gender</AppText>
            <View className="flex-row gap-2">
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ].map((opt) => {
                const isActive = genderFilter === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setGenderFilter(isActive ? undefined : opt.value)}
                    className={cn(
                      "flex-1 items-center rounded-full border py-2",
                      isActive ? "border-brand-teal bg-brand-teal" : "border-brand-gold-border bg-white"
                    )}
                  >
                    <AppText className={cn("font-sans-medium text-xs", isActive ? "text-white" : "text-[#4b5563]")}>
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* H&M Section */}
          <View className="gap-2">
            <AppText className="font-sans-semibold text-xs text-[#4b5563] uppercase tracking-wider">H&M</AppText>
            <View className="flex-row gap-2">
              {[
                { value: "H", label: "H" },
                { value: "M", label: "M" },
                { value: "other", label: "Other" },
              ].map((opt) => {
                const isActive = hAndMFilter === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setHAndMFilter(isActive ? undefined : opt.value)}
                    className={cn(
                      "flex-1 items-center rounded-full border py-2",
                      isActive ? "border-brand-teal bg-brand-teal" : "border-brand-gold-border bg-white"
                    )}
                  >
                    <AppText className={cn("font-sans-medium text-xs", isActive ? "text-white" : "text-[#4b5563]")}>
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 pt-4 border-t border-brand-gold-100">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => {
                resetFilters();
                setIsFilterSheetVisible(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onPress={() => setIsFilterSheetVisible(false)}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
