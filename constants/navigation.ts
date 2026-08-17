import type { Href } from "expo-router";
import type { StaffRole } from "@/constants/theme";

export const ROLE_HOME: Record<StaffRole, Href> = {
  owner: "/(app)/owner",
  branch_manager: "/(app)/manager",
  receptionist: "/(app)/receptionist",
  salesperson: "/(app)/salesperson",
  accountant: "/(app)/accountant",
};
