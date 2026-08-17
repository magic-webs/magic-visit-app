import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ViewProps) {
  return <View className={cn("rounded-2xl bg-white p-4 shadow-sm", className)} {...props} />;
}
