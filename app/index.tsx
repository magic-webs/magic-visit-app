import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { ROLE_HOME } from "@/constants/navigation";
import { theme } from "@/constants/theme";

export default function Index() {
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
  return <Redirect href={ROLE_HOME[session.role!]} />;
}
