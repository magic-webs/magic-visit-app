import { View } from "react-native";
import { Tabs } from "expo-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { LiquidTabBar } from "@/components/layout/LiquidTabBar";
import { AvailabilityToggle } from "@/components/salesperson/AvailabilityToggle";
import { SALESPERSON_TABS } from "@/constants/navItems";
import { useSession } from "@/contexts/SessionContext";

export default function SalespersonTabsLayout() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <AppHeader
        subtitle="Salesperson"
        branchName={session.profile?.branch?.name}
        right={<AvailabilityToggle compact />}
      />
      <Tabs
        tabBar={(props) => <LiquidTabBar {...props} items={SALESPERSON_TABS} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="active" />
        <Tabs.Screen name="visitors" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
