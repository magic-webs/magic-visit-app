import { Pressable, View } from "react-native";
import { db } from "@/lib/db";
import { AppText } from "@/components/ui/AppText";
import { AVAILABILITY_STYLES, type AvailabilityStatus } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";

// Persisted business status ("free to take a visitor"), not connectivity, so it's a regular field/query, not ephemeral presence.
export function AvailabilityToggle({ compact }: { compact?: boolean }) {
  const session = useSession();
  const current = (session.availabilityStatus ?? "offline") as AvailabilityStatus;
  const isAvailable = current === "available";
  const style = AVAILABILITY_STYLES[current];

  function toggle() {
    if (!session.availabilityId) return;
    const next: AvailabilityStatus = isAvailable ? "offline" : "available";
    db.transact(
      db.tx.salespersonAvailability[session.availabilityId].update({
        availabilityStatus: next,
        statusChangedAt: Date.now(),
      }),
    );
  }

  if (compact) {
    return (
      <Pressable onPress={toggle} className="flex-row items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1.5">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
        <AppText className="font-sans-medium text-xs" style={{ color: style.color }}>
          {style.label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View className="flex-row items-center justify-between gap-3 py-1">
      <View className="flex-1">
        <AppText className="font-sans-medium text-sm text-[#1c1c1e]">Availability</AppText>
        <AppText className="mt-0.5 font-sans text-xs text-[#6b7280]">
          Let receptionists see when you&apos;re free to take new visitors.
        </AppText>
      </View>
      <Pressable onPress={toggle} className="rounded-full px-4 py-2" style={{ backgroundColor: `${style.color}1A` }}>
        <AppText className="font-sans-semibold text-sm" style={{ color: style.color }}>
          {style.label}
        </AppText>
      </Pressable>
    </View>
  );
}
