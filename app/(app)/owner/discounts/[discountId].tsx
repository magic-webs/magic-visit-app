import { Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { DetailSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { DISCOUNT_STATUS_STYLES, type DiscountRequestStatus } from "@/constants/theme";

function formatDiscount(type: string, value: number) {
  return type === "percentage" ? `${value}%` : `₹${value.toLocaleString("en-IN")}`;
}

// Read-only for the owner — only the branch manager can reveal/relay the OTP (see manager/discounts/[discountId]).
export default function OwnerDiscountDetailScreen() {
  const { discountId } = useLocalSearchParams<{ discountId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = db.useQuery({
    discountRequests: {
      $: { where: { id: discountId } },
      visitorLog: { customer: {}, branch: {} },
      accountant: {},
    },
  } as any) as { data: any; isLoading: boolean; error: any };

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  const request = (data?.discountRequests as any[] | undefined)?.[0];
  if (!request) return <ErrorState message="Discount request not found." />;

  const style = DISCOUNT_STATUS_STYLES[request.status as DiscountRequestStatus];

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
              {formatDiscount(request.discountType, request.discountValue)} discount ·{" "}
              {request.visitorLog?.branch?.name ?? "—"}
            </AppText>
            <AppText className="font-sans text-xs text-[#9ca3af]">Requested by {request.accountant?.name ?? "—"}</AppText>
          </View>
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${style.color}1A` }}>
            <AppText className="font-sans-medium text-xs" style={{ color: style.color }}>
              {style.label}
            </AppText>
          </View>
        </Card>

        <Card>
          <AppText className="font-sans text-sm text-[#4b5563]">
            {request.status === "pending_otp" && "Awaiting authorization from the branch manager."}
            {request.status === "applied" && "This discount was applied."}
            {request.status === "cancelled" && "This request was cancelled by the accountant."}
            {request.status === "locked" && "Too many incorrect codes were entered for this request."}
          </AppText>
        </Card>
      </ScrollView>
    </View>
  );
}
