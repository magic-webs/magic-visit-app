import { Redirect, Stack } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import { ROLE_HOME } from "@/constants/navigation";

export default function AuthLayout() {
  const session = useSession();

  if (session.status === "ready") {
    return <Redirect href={ROLE_HOME[session.role!]} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
