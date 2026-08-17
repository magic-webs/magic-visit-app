import type { Href } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import type { StaffRole } from "@/constants/theme";
import { ROLE_HOME } from "@/constants/navigation";

export type RequireRoleResult = { state: "checking" } | { state: "authorized" } | { state: "redirect"; redirectTo: Href };

// Mirrors the web app's `allowedRoles` prop on StaffLayout — the difference
// is this returns data instead of rendering, since Expo Router's per-role
// layout file already plays the "wrapper" role.
export function useRequireRole(allowed: StaffRole | StaffRole[]): RequireRoleResult {
  const session = useSession();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];

  if (session.status === "checking") {
    return { state: "checking" };
  }
  if (session.status === "signed-out") {
    return { state: "redirect", redirectTo: "/(auth)/login" };
  }
  if (session.status === "no-profile") {
    return { state: "redirect", redirectTo: "/(auth)/no-access" };
  }
  if (!session.role || !allowedList.includes(session.role)) {
    return { state: "redirect", redirectTo: ROLE_HOME[session.role!] ?? "/(auth)/login" };
  }
  return { state: "authorized" };
}
