import { useLocalSearchParams } from "expo-router";
import { db } from "@/lib/db";
import { BranchForm } from "@/components/branches/BranchForm";
import { FormSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";

export default function EditBranchScreen() {
  const { branchId } = useLocalSearchParams<{ branchId: string }>();
  const { data, isLoading, error } = db.useQuery({
    branches: { $: { where: { id: branchId } } },
  } as any) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <FormSkeleton fields={3} />;
  if (error) return <ErrorState message={error.message} />;

  const branch = (data?.branches as any[] | undefined)?.[0];
  if (!branch) return <ErrorState message="Branch not found." />;

  return <BranchForm mode="edit" initial={branch} />;
}
