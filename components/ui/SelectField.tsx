import { useState, type ReactNode } from "react";
import { Modal, Pressable, View, FlatList } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { AppText } from "./AppText";
import { cn } from "@/lib/cn";
import { theme } from "@/constants/theme";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  accessory?: ReactNode;
}

// RN has no native <select> — this opens a bottom sheet of options instead.
export function SelectField<T extends string = string>({
  label,
  placeholder = "Select…",
  value,
  options,
  onChange,
  disabled,
  icon,
  required,
  helperText,
}: {
  label?: string;
  placeholder?: string;
  value: T | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Left-aligned icon inside the field, e.g. a person/building glyph. */
  icon?: ReactNode;
  /** Shows a small dot next to the label to mark the field mandatory. */
  required?: boolean;
  /** Subtle hint text rendered below the field. */
  helperText?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1.5">
      {label && (
        <View className="flex-row items-center gap-1">
          <AppText className="font-sans-medium text-sm text-[#4b5563]">{label}</AppText>
          {required && <View className="h-1.5 w-1.5 rounded-full bg-status-notInterested" />}
        </View>
      )}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={cn(
          "flex-row items-center justify-between rounded-xl border border-brand-gold-border bg-white px-4 py-3",
          disabled && "opacity-50",
        )}
      >
        <View className="flex-row items-center">
          {icon}
          <AppText
            className={cn("font-sans text-base", icon && "ml-2.5", selected ? "text-[#1c1c1e]" : "text-[#9ca3af]")}
          >
            {selected?.label ?? placeholder}
          </AppText>
        </View>
        <ChevronDown size={18} color="#9ca3af" />
      </Pressable>
      {helperText && <AppText className="font-sans text-xs text-[#9ca3af]">{helperText}</AppText>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] rounded-t-3xl bg-white pb-6 pt-2" onPress={(e) => e.stopPropagation()}>
            <View className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#e5e7eb]" />
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className="flex-row items-center justify-between px-5 py-3.5"
                >
                  <View className="flex-row items-center gap-2">
                    {item.accessory}
                    <AppText className="font-sans text-base text-[#1c1c1e]">{item.label}</AppText>
                  </View>
                  {item.value === value && <Check size={18} color={theme.teal.DEFAULT} />}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
