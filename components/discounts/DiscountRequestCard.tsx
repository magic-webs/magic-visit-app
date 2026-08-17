import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { DISCOUNT_STATUS_STYLES, type DiscountRequestStatus } from "@/constants/theme";

function formatDiscount(type: string, value: number) {
  return type === "percentage" ? `${value}%` : `₹${value.toLocaleString("en-IN")}`;
}

export function DiscountRequestCard({ request }: { request: any }) {
  const status = request.status as DiscountRequestStatus;
  const style = DISCOUNT_STATUS_STYLES[status];
  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">
          {request.visitorLog?.customer?.name ?? "Customer"}
        </AppText>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${style.color}1A` }}>
          <AppText className="font-sans-medium text-xs" style={{ color: style.color }}>
            {style.label}
          </AppText>
        </View>
      </View>
      <AppText className="font-sans text-sm text-[#4b5563]">
        {formatDiscount(request.discountType, request.discountValue)} discount
      </AppText>
      <AppText className="font-sans text-xs text-[#9ca3af]">
        By {request.accountant?.name ?? "—"} · {new Date(request.createdAt).toLocaleDateString("en-IN")}
      </AppText>
    </Card>
  );
}
