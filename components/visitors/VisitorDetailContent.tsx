import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Pressable, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { id } from "@instantdb/react-native";
import {
  ChevronLeft,
  ClipboardList,
  Hash,
  CalendarClock,
  User,
  RefreshCw,
  MessageSquare,
  CalendarPlus,
  Save,
} from "lucide-react-native";
import { db } from "@/lib/db";
import { Avatar } from "@/components/identity/Avatar";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DateField } from "@/components/ui/DateField";
import { DetailSkeleton } from "@/components/layout/Skeletons";
import { ErrorState } from "@/components/layout/ErrorState";
import { useSession } from "@/contexts/SessionContext";
import { theme, type VisitorStatus } from "@/constants/theme";
import { cn } from "@/lib/cn";

// "Follow Up" is deliberately not a selectable option here — scheduling a
// next follow-up below is what sets that status, so listing it here too
// would just be a second, redundant way to do the same thing.
const STATUS_OPTIONS: { value: VisitorStatus; label: string }[] = [
  { value: "none", label: "—" },
  { value: "sold", label: "Sold" },
  { value: "not_interested", label: "Not Interested" },
  { value: "not_available", label: "Not Available" },
  { value: "window_shopping", label: "Window Shopping" },
];

// Shared by receptionist/manager/owner's visitor detail screens — the
// VisitorLogsTable detail-dialog equivalent, as its own route/component
// instance rather than page-level dialog state (see VisitorLogsList).
export function VisitorDetailContent({ logId, belowStatusCard }: { logId: string; belowStatusCard?: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error } = db.useQuery({
    visitorLogs: {
      $: { where: { id: logId } },
      customer: {},
      salesperson: {},
      receptionist: {},
      remarks: { author: {} },
    },
  } as any) as { data: any; isLoading: boolean; error: any };

  const log = (data?.visitorLogs as any[] | undefined)?.[0];

  const [remarkText, setRemarkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [followUpOn, setFollowUpOn] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<VisitorStatus | undefined>();

  useEffect(() => {
    if (log) {
      setFollowUpOn(Boolean(log.followUpDate));
      setFollowUpDate(log.followUpDate ? new Date(log.followUpDate) : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log?.id]);

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!log) return <ErrorState message="Visit not found." />;

  const currentStatus = status ?? (log.status as VisitorStatus);
  const customer = log.customer;

  async function handleSave() {
    setSaving(true);
    try {
      const chunks: any[] = [];
      const patch: Record<string, unknown> = {};
      if (followUpOn && followUpDate) {
        patch.followUpDate = followUpDate.toISOString();
        patch.status = "follow_up";
      } else {
        if (!followUpOn && log.followUpDate) patch.followUpDate = null;
        if (status && status !== log.status) patch.status = status;
      }
      if (Object.keys(patch).length) {
        chunks.push(db.tx.visitorLogs[log.id].update(patch));
      }
      if (remarkText.trim()) {
        const remarkId = id();
        chunks.push(
          db.tx.salesRemarks[remarkId]
            .update({ tenantId: session.tenantId!, remark: remarkText.trim(), createdAt: Date.now() })
            .link({ visitorLog: log.id, author: session.profileId! }),
        );
      }
      if (chunks.length) await db.transact(chunks);
      setRemarkText("");
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const remarks = ((log.remarks as any[]) ?? []).slice().sort((a, b) => b.createdAt - a.createdAt);

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
          <Avatar name={customer?.name ?? "?"} size="lg" />
          <View className="flex-1">
            <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{customer?.name}</AppText>
            <AppText className="font-sans text-sm text-[#6b7280]">{customer?.mobile}</AppText>
            <View className="mt-1">
              <StatusBadge status={currentStatus} />
            </View>
          </View>
        </Card>

        {belowStatusCard}

        <Card className="gap-1">
          <SectionHeader icon={ClipboardList} title="Visit details" />
          <DetailRow icon={Hash} label="Serial Number" value={String(log.serialNumber)} />
          <DetailRow
            icon={CalendarClock}
            label="Visited"
            value={new Date(log.visitedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          />
          <DetailRow icon={User} label="Salesperson" value={log.salesperson?.name ?? "Unassigned"} last />
        </Card>

        <Card className="gap-3">
          <SectionHeader icon={RefreshCw} title="Update Status" color={theme.status.notAvailable} />
          <SelectField
            value={currentStatus}
            onChange={(v) => setStatus(v as VisitorStatus)}
            options={STATUS_OPTIONS}
          />
        </Card>

        <Card className="gap-3">
          <SectionHeader icon={MessageSquare} title="Remarks" subtitle="Add any notes or remarks about this visit" />
          {remarks.length === 0 && <AppText className="font-sans text-sm text-[#9ca3af]">No remarks yet.</AppText>}
          {remarks.map((r) => (
            <View key={r.id} className="border-t border-[#f3f4f6] pt-2">
              <AppText className="font-sans text-sm text-[#1c1c1e]">{r.remark}</AppText>
              <AppText className="mt-0.5 font-sans text-xs text-[#9ca3af]">
                {r.author?.name ?? "Staff"} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
              </AppText>
            </View>
          ))}
          <TextField
            placeholder="Add a remark…"
            value={remarkText}
            onChangeText={setRemarkText}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card className="gap-3">
          <SwitchRow
            icon={CalendarPlus}
            color={theme.status.followUp}
            label="Schedule Next Follow-up"
            description="Set a reminder for the next follow-up visit"
            value={followUpOn}
            onValueChange={(v) => {
              setFollowUpOn(v);
              if (v && !followUpDate) setFollowUpDate(new Date());
            }}
          />
          {followUpOn && <DateField value={followUpDate} onChange={setFollowUpDate} />}
        </Card>

        <Button icon={Save} onPress={handleSave} loading={saving}>
          Save Details
        </Button>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={cn("flex-row items-center gap-3 py-2", !last && "border-b border-dashed border-[#e5e7eb]")}>
      <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${theme.teal.DEFAULT}1A` }}>
        <Icon size={15} color={theme.teal.DEFAULT} />
      </View>
      <AppText className="flex-1 font-sans text-sm text-[#6b7280]">{label}</AppText>
      <AppText className="font-sans-medium text-sm text-[#1c1c1e]">{value}</AppText>
    </View>
  );
}
