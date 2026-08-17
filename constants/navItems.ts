import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  User,
  UserPlus,
  CalendarClock,
  Inbox,
  CheckCircle2,
  History,
  Percent,
} from "lucide-react-native";
import type { TabBarItem } from "@/components/layout/LiquidTabBar";

export const OWNER_TABS: TabBarItem[] = [
  { key: "index", label: "Dashboard", icon: LayoutDashboard },
  { key: "branches", label: "Branches", icon: Building2 },
  { key: "staff", label: "Staff", icon: Users },
  { key: "visitors", label: "Visitors", icon: ClipboardList },
  { key: "discounts", label: "Discounts", icon: Percent },
  { key: "profile", label: "Profile", icon: User },
];

export const MANAGER_TABS: TabBarItem[] = [
  { key: "index", label: "Dashboard", icon: LayoutDashboard },
  { key: "visitors", label: "Visitors", icon: ClipboardList },
  { key: "staff", label: "Staff", icon: Users },
  { key: "follow-ups", label: "Follow Ups", icon: CalendarClock },
  { key: "discounts", label: "Discounts", icon: Percent },
  { key: "profile", label: "Profile", icon: User },
];

export const RECEPTIONIST_TABS: TabBarItem[] = [
  { key: "index", label: "Dashboard", icon: LayoutDashboard },
  { key: "add-visitor", label: "Add Visitor", icon: UserPlus },
  { key: "visitors", label: "Visitors", icon: ClipboardList },
  { key: "follow-ups", label: "Follow Ups", icon: CalendarClock },
  { key: "profile", label: "Profile", icon: User },
];

export const SALESPERSON_TABS: TabBarItem[] = [
  { key: "index", label: "Queue", icon: Inbox },
  { key: "active", label: "Active", icon: CheckCircle2 },
  { key: "visitors", label: "Visitors", icon: ClipboardList },
  { key: "profile", label: "Profile", icon: User },
];

export const ACCOUNTANT_TABS: TabBarItem[] = [
  { key: "index", label: "Apply", icon: Percent },
  { key: "history", label: "History", icon: History },
  { key: "profile", label: "Profile", icon: User },
];
