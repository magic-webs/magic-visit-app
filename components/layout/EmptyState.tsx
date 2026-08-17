import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{title}</AppText>
      {description && (
        <AppText className="mt-1 text-center font-sans text-sm text-[#6b7280]">{description}</AppText>
      )}
    </View>
  );
}
