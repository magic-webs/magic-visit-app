import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";
import { db } from "@/lib/db";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { theme } from "@/constants/theme";

// Lets a manager/owner assign which salespersons a receptionist may pick
// from in the Add Visitor flow — without this, SalespersonPicker's
// receptionist-scoped query has nothing to show.
export function SalespersonAssignmentField({
  branchId,
  value,
  onChange,
}: {
  branchId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data } = db.useQuery(
    branchId ? ({ profiles: { $: { where: { role: "salesperson", "branch.id": branchId } } } } as any) : null,
  ) as { data: any };

  const salespersons: any[] = data?.profiles ?? [];

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  if (!branchId) return null;

  return (
    <View className="gap-1.5">
      <AppText className="font-sans-medium text-sm text-[#4b5563]">Assigned Salespersons</AppText>
      {salespersons.length === 0 ? (
        <AppText className="font-sans text-sm text-[#9ca3af]">No salespersons in this branch yet.</AppText>
      ) : (
        <View className="rounded-2xl border border-brand-gold-border bg-white p-1">
          {salespersons.map((sp, i) => {
            const checked = value.includes(sp.id);
            return (
              <Pressable
                key={sp.id}
                onPress={() => toggle(sp.id)}
                className={cn(
                  "flex-row items-center justify-between rounded-xl px-3 py-2.5",
                  i !== salespersons.length - 1 && "border-b border-[#f3f4f6]",
                )}
              >
                <AppText className="font-sans text-sm text-[#1c1c1e]">{sp.name}</AppText>
                <View
                  className="h-5 w-5 items-center justify-center rounded-md border"
                  style={{
                    borderColor: checked ? theme.teal.DEFAULT : "#d1d5db",
                    backgroundColor: checked ? theme.teal.DEFAULT : "transparent",
                  }}
                >
                  {checked && <Check size={14} color="#fff" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
