import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <AppText className="font-sans-semibold text-base text-[#1c1c1e]">Something went wrong</AppText>
      <AppText className="mt-1 text-center font-sans text-sm text-[#6b7280]">
        {message ?? "Please try again."}
      </AppText>
      {onRetry && (
        <Button variant="outline" className="mt-4" onPress={onRetry}>
          Retry
        </Button>
      )}
    </View>
  );
}
