import { View } from "react-native";
import { Tabs } from "expo-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { LiquidTabBar } from "@/components/layout/LiquidTabBar";
import { RECEPTIONIST_TABS } from "@/constants/navItems";
import { useSession } from "@/contexts/SessionContext";

export default function ReceptionistTabsLayout() {
  const session = useSession();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <AppHeader subtitle="Receptionist" branchName={session.profile?.branch?.name} />
      <Tabs
        tabBar={(props) => <LiquidTabBar {...props} items={RECEPTIONIST_TABS} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="add-visitor" />
        <Tabs.Screen name="visitors" />
        <Tabs.Screen name="follow-ups" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
