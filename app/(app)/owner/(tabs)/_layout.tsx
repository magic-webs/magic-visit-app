import { Pressable, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Bell, Menu } from "lucide-react-native";
import { AppHeader } from "@/components/layout/AppHeader";
import { LiquidTabBar } from "@/components/layout/LiquidTabBar";
import { OWNER_TABS } from "@/constants/navItems";
import { theme } from "@/constants/theme";

export default function OwnerTabsLayout() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <AppHeader
        subtitle="Owner Panel"
        right={
          <View className="flex-row items-center gap-2">
            <Pressable className="h-9 w-9 items-center justify-center rounded-xl bg-brand-gold-100">
              <Bell size={18} color={theme.teal.DEFAULT} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(app)/owner/(tabs)/profile")}
              className="h-9 w-9 items-center justify-center rounded-xl bg-brand-gold-100"
            >
              <Menu size={18} color={theme.teal.DEFAULT} />
            </Pressable>
          </View>
        }
      />
      <Tabs
        tabBar={(props) => <LiquidTabBar {...props} items={OWNER_TABS} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="branches" />
        <Tabs.Screen name="staff" />
        <Tabs.Screen name="visitors" />
        <Tabs.Screen name="discounts" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
