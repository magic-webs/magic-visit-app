import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/cn";

// RN has no CSS-cascade equivalent for a default font — every text node in
// the app should render through this instead of a raw <Text> so Inter is
// actually applied everywhere.
export function AppText({ className, ...props }: TextProps) {
  return <Text className={cn("font-sans text-[#1c1c1e]", className)} {...props} />;
}
