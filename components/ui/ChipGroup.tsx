import { Pressable, View, ScrollView } from "react-native";
import { AppText } from "./AppText";
import { cn } from "@/lib/cn";

export interface ChipOption<T extends string = string> {
  value: T;
  label: string;
}

export function ChipGroup<T extends string = string>({
  options,
  value,
  onChange,
  scrollable,
}: {
  options: ChipOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  scrollable?: boolean;
}) {
  const content = (
    <View className="flex-row gap-2">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-3.5 py-2",
              isActive ? "border-brand-teal bg-brand-teal" : "border-brand-gold-border bg-white",
            )}
          >
            <AppText className={cn("font-sans-medium text-xs", isActive ? "text-white" : "text-[#4b5563]")}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }
  return content;
}
