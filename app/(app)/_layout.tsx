import { Redirect, Slot } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { theme } from "@/constants/theme";

// Defensive re-check for anyone already inside (app)/* — a deep link, stale
// navigation state, or a session expiring mid-use all land here too, not
// just the initial app/index.tsx redirect.
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
