import { Pressable, View } from "react-native";
import { Avatar } from "@/components/identity/Avatar";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { AppText } from "@/components/ui/AppText";
import type { DedupedVisitorEntry } from "@/hooks/useVisitorLogsQuery";
import type { VisitorStatus } from "@/constants/theme";

export function VisitorLogRow({ entry, onPress }: { entry: DedupedVisitorEntry; onPress: () => void }) {
  const { latest, visitCount } = entry;
  const customer = latest.customer;
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-[#f3f4f6] px-4 py-3">
      <Avatar name={customer?.name ?? "?"} />
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{customer?.name ?? "Unknown"}</AppText>
          {visitCount > 1 && (
            <View className="rounded-full bg-brand-gold-100 px-2 py-0.5">
              <AppText className="font-sans-medium text-[10px] text-brand-teal">{visitCount} visits</AppText>
            </View>
          )}
        </View>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <AppText className="font-sans text-xs text-[#6b7280]">{customer?.mobile}</AppText>
          {customer?.hAndM && <AppText className="font-sans text-xs text-[#9ca3af]">· {customer.hAndM}</AppText>}
          <AppText className="font-sans text-xs text-[#9ca3af]">· #{latest.serialNumber}</AppText>
        </View>
      </View>
      <StatusBadge status={latest.status as VisitorStatus} />
    </Pressable>
  );
}
