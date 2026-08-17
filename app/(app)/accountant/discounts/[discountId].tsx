import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { db } from "@/lib/db";
import { verifyDiscountOtp, cancelDiscount, AuthBridgeError } from "@/lib/auth-bridge";
import { Avatar } from "@/components/identity/Avatar";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { DetailSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { DISCOUNT_STATUS_STYLES, type DiscountRequestStatus } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import { useConfirmModal } from "@/contexts/ConfirmModalContext";

function formatDiscount(type: string, value: number) {
  return type === "percentage" ? `${value}%` : `₹${value.toLocaleString("en-IN")}`;
}

export default function DiscountDetailScreen() {
  const { discountId } = useLocalSearchParams<{ discountId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSession();
  const confirm = useConfirmModal();

  const { data, isLoading, error } = db.useQuery({
    discountRequests: {
      $: { where: { id: discountId } },
      visitorLog: { customer: {} },
      accountant: {},
    },
  } as any) as { data: any; isLoading: boolean; error: any };

  const [otp, setOtp] = useState("");
  const [actionError, setActionError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  const request = (data?.discountRequests as any[] | undefined)?.[0];
  if (!request) return <ErrorState message="Discount request not found." />;

  const style = DISCOUNT_STATUS_STYLES[request.status as DiscountRequestStatus];
  const isPendingOtp = request.status === "pending_otp";
  const isOwnRequest = request.accountant?.id === session.profileId;

  async function handleVerify() {
    if (otp.trim().length !== 6) {
      setActionError("Enter the 6-digit code.");
      return;
    }
    setActionError(undefined);
    setSubmitting(true);
    try {
      await verifyDiscountOtp(request.id, otp.trim());
      setOtp("");
    } catch (e) {
      setActionError(e instanceof AuthBridgeError ? e.message : "Couldn't verify the code.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    confirm({
      title: "Cancel this discount request?",
      confirmText: "Cancel Request",
      destructive: true,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await cancelDiscount(request.id);
          router.back();
        } catch (e) {
          setActionError(e instanceof AuthBridgeError ? e.message : "Couldn't cancel this request.");
        } finally {
          setSubmitting(false);
        }
      },
    });
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
        <Card className="flex-row items-center gap-3">
          <Avatar name={request.visitorLog?.customer?.name ?? "?"} size="lg" />
          <View className="flex-1">
            <AppText className="font-sans-semibold text-base text-[#1c1c1e]">
              {request.visitorLog?.customer?.name ?? "Customer"}
            </AppText>
            <AppText className="font-sans text-sm text-[#6b7280]">
              {formatDiscount(request.discountType, request.discountValue)} discount
            </AppText>
          </View>
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${style.color}1A` }}>
            <AppText className="font-sans-medium text-xs" style={{ color: style.color }}>
              {style.label}
            </AppText>
          </View>
        </Card>

        {isPendingOtp && isOwnRequest ? (
          <>
            <TextField
              label="One-Time Code"
              placeholder="6-digit code from your branch manager"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
            {actionError && <AppText className="font-sans text-sm text-status-notInterested">{actionError}</AppText>}
            <Button onPress={handleVerify} loading={submitting}>
              Verify &amp; Apply
            </Button>
            <Button variant="destructiveOutline" onPress={handleCancel} loading={submitting}>
              Cancel Request
            </Button>
          </>
        ) : isPendingOtp ? (
          <Card>
            <AppText className="font-sans text-sm text-[#4b5563]">
              Waiting on the branch manager to authorize this discount.
            </AppText>
          </Card>
        ) : (
          <Card>
            <AppText className="font-sans text-sm text-[#4b5563]">
              {request.status === "applied" && "This discount was applied."}
              {request.status === "cancelled" && "This request was cancelled."}
              {request.status === "locked" && "Too many incorrect codes were entered — start a new request."}
            </AppText>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
