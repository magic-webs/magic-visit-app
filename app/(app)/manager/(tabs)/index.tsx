import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { UserPlus, CalendarClock, ClipboardList, Users, TrendingUp } from "lucide-react-native";
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

export default function ManagerDashboard() {
  const session = useSession();
  const router = useRouter();
  const firstName = session.profile?.name?.split(" ")?.[0] ?? "there";

  const { data } = db.useQuery(
    session.branchId
      ? ({
          visitorLogs: { $: { where: { "branch.id": session.branchId, visitedAt: { $gte: startOfYesterday() } } } },
          profiles: { $: { where: { "branch.id": session.branchId, active: true } } },
        } as any)
      : null,
  ) as { data: any };

  const todayStart = startOfToday();
  const staff: any[] = data?.profiles ?? [];
  const recentLogs: any[] = data?.visitorLogs ?? [];

  const staffYesterday = staff.filter((s) => s.createdAt < todayStart).length;
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
            label="Today's Visitors"
            trend={computeTrend(logsToday.length, logsYesterday.length)}
          />
          <StatCard
            icon={CalendarClock}
            value={followUpsToday}
            label="Follow Ups"
            color={theme.status.followUp}
            trend={computeTrend(followUpsToday, followUpsYesterday)}
          />
          <StatCard
            icon={Users}
            value={staff.length}
            label="Staff"
            color={theme.status.windowShopping}
            trend={computeTrend(staff.length, staffYesterday)}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={90} style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <AppText className="mb-3 font-sans-semibold text-base text-[#1c1c1e]">Quick Actions</AppText>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon={UserPlus}
            label="Add Staff"
            description="Add a new team member to your branch"
            tint={theme.teal.DEFAULT}
            onPress={() => router.push("/(app)/manager/staff/new")}
          />
          <QuickActionCard
            icon={CalendarClock}
            label="Follow Ups"
            description="Review today's scheduled follow-ups"
            tint={theme.status.followUp}
            onPress={() => router.push("/(app)/manager/(tabs)/follow-ups")}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={160} style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <TipBanner
          icon={TrendingUp}
          title="Grow Your Branch"
          description="Keep visitor logs and follow-ups up to date to keep your team on track."
          actionLabel="View Visitors"
          onPress={() => router.push("/(app)/manager/(tabs)/visitors")}
        />
      </FadeSlideIn>
    </ScrollView>
  );
}
