import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/cn";

// RN has no cascading default font, so every text node should render through this (not raw <Text>) to get Inter.
export function AppText({ className, ...props }: TextProps) {
  return <Text className={cn("font-sans text-[#1c1c1e]", className)} {...props} />;
}
