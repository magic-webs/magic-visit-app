import type { ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "./AppText";
import { cn } from "@/lib/cn";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  /** Left-aligned icon inside the field, e.g. a phone/lock glyph. */
  icon?: ReactNode;
  /** Right-aligned accessory, e.g. a show/hide-password toggle. */
  rightAccessory?: ReactNode;
  /** Shows a small dot next to the label to mark the field mandatory. */
  required?: boolean;
  /** Subtle hint text rendered below the field, e.g. "Minimum 6 characters". */
  helperText?: string;
}

export function TextField({
  label,
  error,
  containerClassName,
  className,
  icon,
  rightAccessory,
  required,
  helperText,
  ...props
}: TextFieldProps) {
  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <View className="flex-row items-center gap-1">
          <AppText className="font-sans-medium text-sm text-[#4b5563]">{label}</AppText>
          {required && <View className="h-1.5 w-1.5 rounded-full bg-status-notInterested" />}
        </View>
      )}
      <View
        className={cn(
          "flex-row items-center rounded-xl border border-brand-gold-border bg-white px-4",
          error && "border-status-notInterested",
        )}
      >
        {icon}
        <TextInput
          className={cn(
            "flex-1 py-3 font-sans text-base text-[#1c1c1e]",
            icon && "ml-2.5",
            rightAccessory && "mr-2.5",
            className,
          )}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {rightAccessory}
      </View>
      {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}
      {!error && helperText && <AppText className="font-sans text-xs text-[#9ca3af]">{helperText}</AppText>}
    </View>
  );
}
