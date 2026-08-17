import { ChipGroup } from "@/components/ui/ChipGroup";
import type { DateFilter } from "@/hooks/useVisitorLogsQuery";

const OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "3days", label: "3 Days" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "followups", label: "Follow Ups" },
  { value: "all", label: "All" },
];

export function VisitorFilterChips({ value, onChange }: { value: DateFilter; onChange: (v: DateFilter) => void }) {
  return <ChipGroup options={OPTIONS} value={value} onChange={onChange} scrollable />;
}
