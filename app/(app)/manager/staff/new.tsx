import { StaffForm } from "@/components/staff/StaffForm";
import { useSession } from "@/contexts/SessionContext";

export default function NewStaffScreen() {
  const session = useSession();
  return (
    <StaffForm mode="create" restrictRoles={["receptionist", "salesperson"]} defaultBranchId={session.branchId} />
  );
}
