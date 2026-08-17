import { Redirect, Stack } from "expo-router";
import { useRequireRole } from "@/hooks/useRequireRole";
import { LoadingState } from "@/components/layout/LoadingState";

export default function ManagerLayout() {
  const result = useRequireRole("branch_manager");

  if (result.state === "checking") return <LoadingState />;
  if (result.state === "redirect") return <Redirect href={result.redirectTo} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="staff/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="staff/[staffId]" options={{ presentation: "modal" }} />
      <Stack.Screen name="visitors/[logId]" options={{ presentation: "modal" }} />
      <Stack.Screen name="follow-ups/[logId]" options={{ presentation: "modal" }} />
      <Stack.Screen name="discounts/[discountId]" options={{ presentation: "modal" }} />
      <Stack.Screen name="prime-members" options={{ presentation: "modal" }} />
    </Stack>
  );
}
