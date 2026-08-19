import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Crown, Search } from "lucide-react-native";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { SwitchRow } from "@/components/ui/SwitchRow";

// Matches the accountant lookup screen's "Prime" badge color; no shared theme token, so keep in sync manually.
const PRIME_COLOR = "#b45309";

// instant.perms.ts scopes customer updates to isOwner || isOwnBranchManager, so saving outside a manager's own branch is rejected server-side and surfaced below as a plain error.
export function PrimeMemberManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mobile, setMobile] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();
  const [customer, setCustomer] = useState<any | null>(null);

  const [isPrimeMember, setIsPrimeMember] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  async function handleSearch() {
    const normalized = mobile.replace(/\D/g, "");
    if (!normalized) return;
    setSearchError(undefined);
    setSearching(true);
    try {
      const { data } = await (db.queryOnce as any)({ customers: { $: { where: { mobile: normalized } } } });
      const found = (data as any)?.customers?.[0];
      if (!found) {
        setSearchError("No customer found with that mobile number.");
        return;
      }
      setCustomer(found);
      setIsPrimeMember(Boolean(found.isPrimeMember));
      setDiscountType((found.primeDiscountType as "percentage" | "amount") ?? "percentage");
      setDiscountValue(found.primeDiscountValue ? String(found.primeDiscountValue) : "");
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function reset() {
    setCustomer(null);
    setMobile("");
    setSaveError(undefined);
  }

  async function handleSave() {
    if (isPrimeMember) {
      const value = Number(discountValue);
      if (!discountValue.trim() || !(value > 0)) {
        setSaveError("Enter a discount value greater than 0.");
        return;
      }
    }
    setSaveError(undefined);
    setSaving(true);
    try {
      await db.transact(
        db.tx.customers[customer.id].update({
          isPrimeMember,
          ...(isPrimeMember
            ? { primeDiscountType: discountType, primeDiscountValue: Number(discountValue) }
            : { primeDiscountType: null, primeDiscountValue: null }),
        }),
      );
      router.back();
    } catch {
      setSaveError("Couldn't save. If this customer isn't in your branch, you may not have permission to update them.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-brand-gold-50">
      <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 12 }}>
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft size={22} color="#1c1c1e" />
        </Pressable>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4 pt-1">
        <AppText className="font-sans-semibold text-lg text-[#1c1c1e]">Manage Prime Members</AppText>

        {!customer ? (
          <>
            <TextField
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="numeric"
              error={searchError}
            />
            <Button icon={Search} onPress={handleSearch} loading={searching}>
              Find
            </Button>
          </>
        ) : (
          <>
            <Card className="flex-row items-center gap-3">
              <Avatar name={customer.name ?? "?"} size="lg" />
              <View className="flex-1">
                <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{customer.name}</AppText>
                <AppText className="font-sans text-sm text-[#6b7280]">{customer.mobile}</AppText>
              </View>
            </Card>

            <Card className="gap-3">
              <SwitchRow
                icon={Crown}
                color={PRIME_COLOR}
                label="Prime Member"
                description="Gets a preset discount the accountant can apply instantly, with no authorization needed."
                value={isPrimeMember}
                onValueChange={setIsPrimeMember}
              />
              {isPrimeMember && (
                <>
                  <SelectField
                    label="Discount Type"
                    value={discountType}
                    onChange={(v) => setDiscountType(v as "percentage" | "amount")}
                    options={[
                      { value: "percentage", label: "Percentage" },
                      { value: "amount", label: "Fixed amount" },
                    ]}
                  />
                  <TextField
                    label="Value"
                    placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 5000"}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    keyboardType="numeric"
                  />
                </>
              )}
            </Card>

            {saveError && <AppText className="font-sans text-sm text-status-notInterested">{saveError}</AppText>}

            <Button onPress={handleSave} loading={saving}>
              Save
            </Button>
            <Button variant="ghost" onPress={reset}>
              Not this customer? Search again
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
}
