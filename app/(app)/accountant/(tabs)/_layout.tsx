import { View } from "react-native";
import { Tabs } from "expo-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { LiquidTabBar } from "@/components/layout/LiquidTabBar";
import { ACCOUNTANT_TABS } from "@/constants/navItems";
import { useSession } from "@/contexts/SessionContext";

export default function AccountantTabsLayout() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <AppHeader subtitle="Accountant" branchName={session.profile?.branch?.name} />
      <Tabs
        tabBar={(props) => <LiquidTabBar {...props} items={ACCOUNTANT_TABS} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
