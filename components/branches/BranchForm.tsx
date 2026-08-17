import { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { id } from "@instantdb/react-native";
import { db } from "@/lib/db";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { Button } from "@/components/ui/Button";

export function BranchForm({ mode, initial }: { mode: "create" | "edit"; initial?: any }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit() {
    if (!name.trim() || !location.trim()) {
      setError("Name and location are required.");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await db.transact(
          db.tx.branches[id()].update({
            name: name.trim(),
            location: location.trim(),
            ...(phone.trim() && { phone: phone.trim() }),
            active: true,
            createdAt: Date.now(),
          }),
        );
      } else {
        await db.transact(
          db.tx.branches[initial.id].update({
            name: name.trim(),
            location: location.trim(),
            ...(phone.trim() && { phone: phone.trim() }),
            active,
          }),
        );
      }
      router.back();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="gap-4 p-4">
      <TextField label="Branch name" value={name} onChangeText={setName} placeholder="e.g. Ram Nagar" />
      <TextField label="Location" value={location} onChangeText={setLocation} placeholder="Area / city" />
      <TextField label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {mode === "edit" && <SwitchRow label="Active" value={active} onValueChange={setActive} />}
      {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}
      <Button onPress={handleSubmit} loading={submitting}>
        {mode === "create" ? "Create Branch" : "Save Changes"}
      </Button>
    </ScrollView>
  );
}
