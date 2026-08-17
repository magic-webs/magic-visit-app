import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { User, Phone, UserCog, Lock, Eye, EyeOff, Building2, ShieldCheck, UserPlus } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { Button } from "@/components/ui/Button";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { FormHeaderBanner } from "@/components/layout/FormHeaderBanner";
import { SalespersonAssignmentField } from "@/components/staff/SalespersonAssignmentField";
import { createStaff, updateStaff, AuthBridgeError } from "@/lib/auth-bridge";
import type { StaffRole } from "@/constants/theme";

const CREATABLE_ROLES: { value: StaffRole; label: string }[] = [
  { value: "branch_manager", label: "Branch Manager" },
  { value: "receptionist", label: "Receptionist" },
  { value: "salesperson", label: "Salesperson" },
  { value: "accountant", label: "Accountant" },
];

// Every staff create/update goes through the Worker (lib/auth-bridge.ts),
// never a direct db.transact — see instant.perms.ts for why `profiles`
// never accepts client writes.
export function StaffForm({
  mode,
  initial,
  branches,
  restrictRoles,
  defaultBranchId,
}: {
  mode: "create" | "edit";
  initial?: any;
  branches?: { id: string; name: string }[];
  restrictRoles?: StaffRole[];
  defaultBranchId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole | undefined>(initial?.role);
  const [branchId, setBranchId] = useState<string | undefined>(initial?.branch?.id ?? defaultBranchId);
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [assignedSalespersonIds, setAssignedSalespersonIds] = useState<string[]>(
    (initial?.assignedSalespersons ?? []).map((sp: any) => sp.id),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = CREATABLE_ROLES.filter((r) => !restrictRoles || restrictRoles.includes(r.value));
  const isEditingReceptionist = mode === "edit" && initial?.role === "receptionist";

  async function handleSubmit() {
    if (!name.trim() || mobile.replace(/\D/g, "").length < 10) {
      setError("Name and a valid mobile number are required.");
      return;
    }
    if (mode === "create" && (!role || password.length < 6)) {
      setError("Role and a password (6+ characters) are required.");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createStaff({ name: name.trim(), mobile, password, role: role!, branchId });
      } else {
        await updateStaff({
          id: initial.id,
          name: name.trim(),
          mobile,
          ...(password && { password }),
          branchId,
          active,
          ...(isEditingReceptionist && { assignedSalespersonIds }),
        });
      }
      router.back();
    } catch (err) {
      setError(err instanceof AuthBridgeError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="pb-6">
      <FormHeaderBanner
        title={mode === "create" ? "Add Staff Member" : "Edit Staff Member"}
        subtitle={mode === "create" ? "Create a new team member account" : "Update team member details"}
        icon={mode === "create" ? UserPlus : UserCog}
      />

      <View className="-mt-6 gap-4 px-4">
        <InfoBanner
          icon={ShieldCheck}
          title="Secure Account Access"
          description={
            mode === "create"
              ? "The new staff member will get instant login access based on the role you assign below."
              : "Changes take effect immediately — the staff member may need to sign in again."
          }
        />

        <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <TextField
            label="Full Name"
            required
            icon={<User size={18} color="#9ca3af" />}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />
          <TextField
            label="Mobile Number"
            required
            icon={<Phone size={18} color="#9ca3af" />}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="10-digit mobile number"
          />
          {mode === "create" && (
            <SelectField
              label="Role"
              required
              icon={<UserCog size={18} color="#9ca3af" />}
              helperText="Determines what this staff member can access"
              value={role}
              onChange={(v) => setRole(v as StaffRole)}
              options={roleOptions}
            />
          )}
          <TextField
            label={mode === "create" ? "Password" : "New Password"}
            required={mode === "create"}
            icon={<Lock size={18} color="#9ca3af" />}
            rightAccessory={
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
              </Pressable>
            }
            helperText={mode === "create" ? "Minimum 6 characters" : "Leave blank to keep current password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          {branches && (
            <SelectField
              label="Branch"
              icon={<Building2 size={18} color="#9ca3af" />}
              helperText="Which branch this staff member belongs to"
              value={branchId}
              onChange={setBranchId}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          )}
          {mode === "edit" && <SwitchRow label="Active" value={active} onValueChange={setActive} />}
          {isEditingReceptionist && (
            <SalespersonAssignmentField
              branchId={initial?.branch?.id}
              value={assignedSalespersonIds}
              onChange={setAssignedSalespersonIds}
            />
          )}
          {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}
          <Button icon={mode === "create" ? UserPlus : undefined} onPress={handleSubmit} loading={submitting}>
            {mode === "create" ? "Create Staff" : "Save Changes"}
          </Button>
          <Button variant="outline" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
