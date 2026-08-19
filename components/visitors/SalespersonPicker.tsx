import { db } from "@/lib/db";
import { SelectField } from "@/components/ui/SelectField";
import { AvailabilityDot } from "@/components/identity/AvailabilityDot";
import { useSession } from "@/contexts/SessionContext";

// Receptionists only see salespersons assigned to them; manager/owner see every salesperson in the branch.
export function SalespersonPicker({
  value,
  onChange,
  branchId,
}: {
  value: string | undefined;
  onChange: (id: string) => void;
  branchId?: string;
}) {
  const session = useSession();
  const isReceptionist = session.role === "receptionist";

  const { data } = db.useQuery(
    isReceptionist
      ? ({
          profiles: {
            $: { where: { id: session.profileId ?? "__none__" } },
            assignedSalespersons: { availability: {} },
          },
        } as any)
      : branchId
        ? ({
            profiles: {
              $: { where: { role: "salesperson", "branch.id": branchId } },
              availability: {},
            },
          } as any)
        : null,
  ) as { data: any };

  const salespersons: any[] = isReceptionist
    ? ((data?.profiles as any[] | undefined)?.[0]?.assignedSalespersons ?? [])
    : ((data?.profiles as any[]) ?? []);

  const options = salespersons.map((sp) => ({
    value: sp.id as string,
    label: sp.name as string,
    accessory: <AvailabilityDot status={sp.availability?.availabilityStatus ?? "offline"} />,
  }));

  return (
    <SelectField
      label="Assign Salesperson"
      placeholder="Choose a salesperson"
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}
