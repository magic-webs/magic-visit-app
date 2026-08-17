import { db } from "@/lib/db";
import { StaffForm } from "@/components/staff/StaffForm";
import { FormSkeleton } from "@/components/layout/Skeletons";

export default function NewStaffScreen() {
  const { data, isLoading } = db.useQuery({ branches: { $: { where: { active: true } } } } as any) as {
    data: any;
    isLoading: boolean;
  };

  if (isLoading) return <FormSkeleton />;

  return <StaffForm mode="create" branches={data?.branches ?? []} />;
}
