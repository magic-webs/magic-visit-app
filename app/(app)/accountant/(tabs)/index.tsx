import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Search, KeyRound, Crown } from "lucide-react-native";
import { db } from "@/lib/db";
import { createDiscount, AuthBridgeError } from "@/lib/auth-bridge";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/identity/Avatar";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { useSession } from "@/contexts/SessionContext";

const PRIME_COLOR = "#b45309";

function formatDiscount(type: string, value: number) {
  return type === "percentage" ? `${value}%` : `₹${value.toLocaleString("en-IN")}`;
}

// Deliberately no salesperson request queue anymore — see instant.perms.ts/discountRequests.
export default function ApplyDiscountScreen() {
  const session = useSession();
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();
  const [visitorLog, setVisitorLog] = useState<any | null>(null);

  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function handleFind() {
    const normalizedMobile = mobile.replace(/\D/g, "");
    if (!normalizedMobile) return;
    setSearchError(undefined);
    setSearching(true);
    try {
      const { data } = await (db.queryOnce as any)({
        visitorLogs: {
          $: {
            where: { "customer.mobile": normalizedMobile, "branch.id": session.branchId },
            order: { visitedAt: "desc" },
            limit: 1,
          },
          customer: {},
          salesperson: {},
        },
      });
      const found = (data as any)?.visitorLogs?.[0];
      if (!found) {
        setSearchError("No visit found for that mobile number in your branch.");
        return;
      }
      setVisitorLog(found);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function reset() {
    setVisitorLog(null);
    setMobile("");
    setDiscountValue("");
    setSubmitError(undefined);
  }

  const customer = visitorLog?.customer;
  const isPrime = Boolean(customer?.isPrimeMember);
  const primeConfigured = isPrime && customer?.primeDiscountType && customer?.primeDiscountValue > 0;

  async function submit(type: "percentage" | "amount", value: number) {
    setSubmitError(undefined);
    setSubmitting(true);
    try {
      const { id: discountId } = await createDiscount({
        visitorLogId: visitorLog.id,
        discountType: type,
        discountValue: value,
      });
      router.push({ pathname: "/(app)/accountant/discounts/[discountId]", params: { discountId } });
      reset();
    } catch (e) {
      setSubmitError(e instanceof AuthBridgeError ? e.message : "Couldn't apply this discount.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleApplyPrime() {
    submit(customer.primeDiscountType, customer.primeDiscountValue);
  }

  function handleApply() {
    const value = Number(discountValue);
    if (!discountValue.trim() || !(value > 0)) {
      setSubmitError("Enter a discount value greater than 0.");
      return;
    }
    submit(discountType, value);
  }

  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="gap-4 p-4">
      {!visitorLog ? (
        <>
          <AppText className="font-sans-semibold text-lg text-[#1c1c1e]">Find a Customer</AppText>
          <TextField
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="numeric"
            error={searchError}
          />
          <Button icon={Search} onPress={handleFind} loading={searching}>
            Find
          </Button>
        </>
      ) : (
        <>
          <Card className="flex-row items-center gap-3">
            <Avatar name={customer?.name ?? "?"} size="lg" />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{customer?.name ?? "Customer"}</AppText>
                {isPrime && (
                  <View className="flex-row items-center gap-1 rounded-full px-2 py-0.5" style={{ backgroundColor: `${PRIME_COLOR}1A` }}>
                    <Crown size={11} color={PRIME_COLOR} />
                    <AppText className="font-sans-medium text-[11px]" style={{ color: PRIME_COLOR }}>
                      Prime
                    </AppText>
                  </View>
                )}
              </View>
              <AppText className="font-sans text-sm text-[#6b7280]">
                {new Date(visitorLog.visitedAt).toLocaleDateString("en-IN")}
              </AppText>
              {visitorLog.salesperson?.name && (
                <AppText className="font-sans text-xs text-[#9ca3af]">Handled by {visitorLog.salesperson.name}</AppText>
              )}
            </View>
          </Card>

          {isPrime ? (
            primeConfigured ? (
              <>
                <Card className="items-center gap-1 py-5">
                  <AppText className="font-sans text-sm text-[#6b7280]">Prime Discount</AppText>
                  <AppText className="font-sans-bold text-2xl text-[#1c1c1e]">
                    {formatDiscount(customer.primeDiscountType, customer.primeDiscountValue)}
                  </AppText>
                </Card>
                <InfoBanner
                  icon={Crown}
                  title="No authorization needed"
                  description="This customer's prime discount applies instantly — no branch-manager code required."
                />
                {submitError && <AppText className="font-sans text-sm text-status-notInterested">{submitError}</AppText>}
                <Button icon={Crown} onPress={handleApplyPrime} loading={submitting}>
                  Apply Prime Discount
                </Button>
              </>
            ) : (
              <Card>
                <AppText className="font-sans text-sm text-[#4b5563]">
                  This customer is a prime member but has no discount configured. Ask a branch manager or owner to set
                  one.
                </AppText>
              </Card>
            )
          ) : (
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
                placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 5000"}
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="numeric"
              />

              <InfoBanner
                icon={KeyRound}
                title="Branch manager authorization required"
                description="The branch manager and owner will be notified. Ask the branch manager for the one-time code to apply this discount."
              />

              {submitError && <AppText className="font-sans text-sm text-status-notInterested">{submitError}</AppText>}

              <Button onPress={handleApply} loading={submitting}>
                Send for Authorization
              </Button>
            </>
          )}
          <Button variant="ghost" onPress={reset}>
            Not this customer? Search again
          </Button>
        </>
      )}
    </ScrollView>
  );
}
