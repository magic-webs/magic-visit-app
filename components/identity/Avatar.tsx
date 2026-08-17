import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { theme } from "@/constants/theme";

const SIZE_STYLES = {
  sm: { box: "h-8 w-8", text: "text-xs" },
  md: { box: "h-11 w-11", text: "text-base" },
  lg: { box: "h-16 w-16", text: "text-xl" },
} as const;

// Colored circle with the person's first-letter initial — matches the source
// app's convention of never using image avatars for people.
export function Avatar({ name, size = "md" }: { name: string; size?: keyof typeof SIZE_STYLES }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const styles = SIZE_STYLES[size];
  return (
    <View
      className={cn("items-center justify-center rounded-full", styles.box)}
      style={{ backgroundColor: theme.teal.DEFAULT }}
    >
      <AppText className={cn("font-sans-semibold text-white", styles.text)}>{initial}</AppText>
    </View>
  );
}
