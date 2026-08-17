import { View } from "react-native";
import { Tabs } from "expo-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { LiquidTabBar } from "@/components/layout/LiquidTabBar";
import { MANAGER_TABS } from "@/constants/navItems";
import { useSession } from "@/contexts/SessionContext";

export default function ManagerTabsLayout() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <AppHeader subtitle="Branch Manager" branchName={session.profile?.branch?.name} />
      <Tabs
        tabBar={(props) => <LiquidTabBar {...props} items={MANAGER_TABS} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="visitors" />
        <Tabs.Screen name="staff" />
        <Tabs.Screen name="follow-ups" />
        <Tabs.Screen name="discounts" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
