import { createElement, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { AppText } from "./AppText";
import { cn } from "@/lib/cn";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// yyyy-mm-dd, what <input type="date"> reads and emits — built from local
// Y/M/D rather than toISOString(), which is UTC and can roll the date back
// a day in any timezone ahead of UTC.
function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = "Select date",
}: {
  label?: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
}) {
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  function open() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode: "date",
        onChange: (_event, date) => {
          if (date) onChange(date);
        },
      });
    } else if (Platform.OS === "ios") {
      setShowIOSPicker(true);
    }
  }

  // @react-native-community/datetimepicker ships no web implementation at
  // all, so web renders a plain HTML date input instead — created
  // imperatively since `input` isn't a JSX intrinsic in this project's
  // React Native type setup (no @types/react-dom).
  if (Platform.OS === "web") {
    return (
      <View className="gap-1.5">
        {label && <AppText className="font-sans-medium text-sm text-[#4b5563]">{label}</AppText>}
        {createElement("input", {
          type: "date",
          value: value ? toInputValue(value) : "",
          onChange: (e: any) => {
            const raw = e.target.value;
            if (raw) onChange(new Date(`${raw}T00:00:00`));
          },
          placeholder,
          style: {
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: "#1c1c1e",
            border: "1px solid #e8d98a",
            borderRadius: 12,
            padding: "12px 16px",
            backgroundColor: "#fff",
            width: "100%",
            boxSizing: "border-box",
          },
        })}
      </View>
    );
  }

  return (
    <View className="gap-1.5">
      {label && <AppText className="font-sans-medium text-sm text-[#4b5563]">{label}</AppText>}
      <Pressable
        onPress={open}
        className="flex-row items-center justify-between rounded-xl border border-brand-gold-border bg-white px-4 py-3"
      >
        <AppText className={cn("font-sans text-base", value ? "text-[#1c1c1e]" : "text-[#9ca3af]")}>
          {value ? formatDate(value) : placeholder}
        </AppText>
        <Calendar size={18} color="#9ca3af" />
      </Pressable>

      {showIOSPicker && Platform.OS === "ios" && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="inline"
          onChange={(_event, date) => {
            setShowIOSPicker(false);
            if (date) onChange(date);
          }}
        />
      )}
    </View>
  );
}
