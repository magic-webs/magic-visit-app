import { Redirect, Stack } from "expo-router";
import { useRequireRole } from "@/hooks/useRequireRole";
import { LoadingState } from "@/components/layout/LoadingState";

export default function AccountantLayout() {
  const result = useRequireRole("accountant");

  if (result.state === "checking") return <LoadingState />;
  if (result.state === "redirect") return <Redirect href={result.redirectTo} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="discounts/[discountId]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
