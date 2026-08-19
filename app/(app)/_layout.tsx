import { Redirect, Slot } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { theme } from "@/constants/theme";

// Defensive re-check: deep links, stale nav state, or a mid-use session expiry can land here too, not just the initial redirect.
export default function AppLayout() {
  const session = useSession();

  if (session.status === "checking") {
    return (
      <View className="flex-1 items-center justify-center bg-brand-gold-50">
        <ActivityIndicator size="large" color={theme.teal.DEFAULT} />
      </View>
    );
  }
  if (session.status === "signed-out") {
    return <Redirect href="/(auth)/login" />;
  }
  if (session.status === "no-profile") {
    return <Redirect href="/(auth)/no-access" />;
  }

  return <Slot />;
}
