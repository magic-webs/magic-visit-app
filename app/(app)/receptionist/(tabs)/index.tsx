import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { UserPlus, ClipboardList, CalendarClock, TrendingUp } from "lucide-react-native";
import { DashboardHeroBanner } from "@/components/dashboard/DashboardHeroBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { TipBanner } from "@/components/dashboard/TipBanner";
import { FadeSlideIn } from "@/components/ui/FadeSlideIn";
import { AppText } from "@/components/ui/AppText";
import { useSession } from "@/contexts/SessionContext";
import { db } from "@/lib/db";
import { computeTrend, startOfToday, startOfYesterday } from "@/lib/trend";
import { theme } from "@/constants/theme";

export default function ReceptionistDashboard() {
  const session = useSession();
  const router = useRouter();
  const firstName = session.profile?.name?.split(" ")?.[0] ?? "there";

  const { data } = db.useQuery(
    session.profileId
      ? ({
          visitorLogs: {
            $: { where: { "receptionist.id": session.profileId, visitedAt: { $gte: startOfYesterday() } } },
          },
        } as any)
      : null,
  ) as { data: any };

  const todayStart = startOfToday();
  const recentLogs: any[] = data?.visitorLogs ?? [];
  const logsToday = recentLogs.filter((l) => l.visitedAt >= todayStart);
  const logsYesterday = recentLogs.filter((l) => l.visitedAt < todayStart);
  const followUpsToday = logsToday.filter((l) => l.followUpDate).length;
  const followUpsYesterday = logsYesterday.filter((l) => l.followUpDate).length;

  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="pb-48">
      <DashboardHeroBanner name={firstName} />

      <FadeSlideIn style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <AppText className="mb-3 font-sans-semibold text-base text-[#1c1c1e]">Overview</AppText>
        <View className="flex-row flex-wrap gap-3">
          <StatCard
            icon={ClipboardList}
            value={logsToday.length}
            label="Visitors Today"
            trend={computeTrend(logsToday.length, logsYesterday.length)}
            onPress={() => router.push("/(app)/receptionist/(tabs)/visitors")}
          />
          <StatCard
            icon={CalendarClock}
            value={followUpsToday}
            label="Follow Ups"
            color={theme.status.followUp}
            trend={computeTrend(followUpsToday, followUpsYesterday)}
            onPress={() => router.push("/(app)/receptionist/(tabs)/follow-ups")}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={90} style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <AppText className="mb-3 font-sans-semibold text-base text-[#1c1c1e]">Quick Actions</AppText>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon={UserPlus}
            label="Add Visitor"
            description="Log a new walk-in customer"
            tint={theme.teal.DEFAULT}
            onPress={() => router.push("/(app)/receptionist/(tabs)/add-visitor")}
          />
          <QuickActionCard
            icon={ClipboardList}
            label="View Logs"
            description="See all visitor entries"
            tint="#7c3aed"
            onPress={() => router.push("/(app)/receptionist/(tabs)/visitors")}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={160} style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <TipBanner
          icon={TrendingUp}
          title="Stay on Top of Follow-ups"
          description="Check today's follow-up queue so no visitor slips through the cracks."
          actionLabel="View Follow-ups"
          onPress={() => router.push("/(app)/receptionist/(tabs)/follow-ups")}
        />
      </FadeSlideIn>
    </ScrollView>
  );
}
