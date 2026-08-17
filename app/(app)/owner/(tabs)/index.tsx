import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Building2, Users, ClipboardList, UserPlus, TrendingUp } from "lucide-react-native";
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

export default function OwnerDashboard() {
  const session = useSession();
  const router = useRouter();
  const firstName = session.profile?.name?.split(" ")?.[0] ?? "there";

  const { data } = db.useQuery({
    branches: { $: { where: { active: true } } },
    profiles: { $: { where: { active: true } } },
    visitorLogs: { $: { where: { visitedAt: { $gte: startOfYesterday() } } } },
  } as any) as { data: any };

  const todayStart = startOfToday();
  const branches: any[] = data?.branches ?? [];
  const staff: any[] = data?.profiles ?? [];
  const recentLogs: any[] = data?.visitorLogs ?? [];

  const branchesYesterday = branches.filter((b) => b.createdAt < todayStart).length;
  const staffYesterday = staff.filter((s) => s.createdAt < todayStart).length;
  const visitorsToday = recentLogs.filter((l) => l.visitedAt >= todayStart).length;
  const visitorsYesterday = recentLogs.filter((l) => l.visitedAt < todayStart).length;

  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="pb-48">
      <DashboardHeroBanner name={firstName} />

      <FadeSlideIn style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <AppText className="mb-3 font-sans-semibold text-base text-[#1c1c1e]">Overview</AppText>
        <View className="flex-row flex-wrap gap-3">
          <StatCard
            icon={Building2}
            value={branches.length}
            label="Branches"
            trend={computeTrend(branches.length, branchesYesterday)}
          />
          <StatCard
            icon={Users}
            value={staff.length}
            label="Staff"
            color={theme.status.followUp}
            trend={computeTrend(staff.length, staffYesterday)}
          />
          <StatCard
            icon={ClipboardList}
            value={visitorsToday}
            label="Today's Visitors"
            color={theme.status.windowShopping}
            trend={computeTrend(visitorsToday, visitorsYesterday)}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={90} style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <AppText className="mb-3 font-sans-semibold text-base text-[#1c1c1e]">Quick Actions</AppText>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon={Building2}
            label="Add Branch"
            description="Register a new branch to your business"
            tint={theme.teal.DEFAULT}
            onPress={() => router.push("/(app)/owner/branches/new")}
          />
          <QuickActionCard
            icon={UserPlus}
            label="Add Staff"
            description="Add new staff member to your team"
            tint="#7c3aed"
            onPress={() => router.push("/(app)/owner/staff/new")}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={160} style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <TipBanner
          icon={TrendingUp}
          title="Grow Your Business"
          description="Keep adding staff to manage your jewellery business easily."
          actionLabel="View Reports"
          onPress={() => router.push("/(app)/owner/(tabs)/visitors")}
        />
      </FadeSlideIn>
    </ScrollView>
  );
}
