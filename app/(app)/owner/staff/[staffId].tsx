import { useLocalSearchParams } from "expo-router";
import { db } from "@/lib/db";
import { StaffForm } from "@/components/staff/StaffForm";
import { FormSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";

export default function EditStaffScreen() {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const { data, isLoading, error } = db.useQuery({
    profiles: { $: { where: { id: staffId } }, branch: {}, assignedSalespersons: {} },
    branches: { $: { where: { active: true } } },
  } as any) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <FormSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  const staff = (data?.profiles as any[] | undefined)?.[0];
  if (!staff) return <ErrorState message="Staff member not found." />;

  return <StaffForm mode="edit" initial={staff} branches={data?.branches ?? []} />;
}
