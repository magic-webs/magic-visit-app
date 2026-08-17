import { View } from "react-native";
import { Check } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { theme } from "@/constants/theme";

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row items-center justify-center">
      {Array.from({ length: total }, (_, i) => i + 1).map((step, idx) => {
        const isDone = step < current;
        const isActive = step === current;
        return (
          <View key={step} className="flex-row items-center">
            <View
              className={cn(
                "h-8 w-8 items-center justify-center rounded-full",
                isDone ? "bg-brand-teal" : "border bg-white",
                !isDone && isActive ? "border-brand-teal" : "",
                !isDone && !isActive ? "border-[#e5e7eb]" : "",
              )}
            >
              {isDone ? (
                <Check size={16} color="#fff" />
              ) : (
                <AppText
                  className="font-sans-semibold text-xs"
                  style={{ color: isActive ? theme.teal.DEFAULT : "#9ca3af" }}
                >
                  {step}
                </AppText>
              )}
            </View>
            {idx < total - 1 && <View className={cn("h-0.5 w-6", isDone ? "bg-brand-teal" : "bg-[#e5e7eb]")} />}
          </View>
        );
      })}
    </View>
  );
}
