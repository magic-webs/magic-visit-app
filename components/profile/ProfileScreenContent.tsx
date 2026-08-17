import type { ReactNode } from "react";
import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { Phone, Building2, Calendar, ShieldCheck, Lock, ChevronRight, Copy, Check, LogOut } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeSlideIn } from "@/components/ui/FadeSlideIn";
import { GradientView } from "@/components/ui/GradientView";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { useSession } from "@/contexts/SessionContext";
import { useConfirmModal } from "@/contexts/ConfirmModalContext";
import { db } from "@/lib/db";
import { unregisterForPushNotifications } from "@/lib/push-notifications";
import { ROLE_STYLES, theme } from "@/constants/theme";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Pressable
      onPress={handleCopy}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center rounded-xl bg-brand-teal/10"
    >
      {copied ? <Check size={16} color={theme.teal.DEFAULT} /> : <Copy size={16} color={theme.teal.DEFAULT} />}
    </Pressable>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
  isLast,
}: {
  icon: typeof Phone;
  label: string;
  value?: string;
  copyable?: boolean;
  isLast?: boolean;
}) {
  if (!value) return null;
  return (
    <View
      className={
        isLast
          ? "flex-row items-center gap-3 py-3.5"
          : "flex-row items-center gap-3 border-b border-[#f3f4f6] py-3.5"
      }
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10">
        <Icon size={18} color={theme.teal.DEFAULT} />
      </View>
      <View className="flex-1">
        <AppText className="font-sans text-xs text-[#9ca3af]">{label}</AppText>
        <AppText className="font-sans-bold text-base text-[#1c1c1e]">{value}</AppText>
      </View>
      {copyable && <CopyButton value={value} />}
    </View>
  );
}

// Shared across every role's profile.tsx — role-specific screens pass
// `extraRows` for anything beyond the common identity/contact info (e.g.
// the salesperson's full AvailabilityToggle).
export function ProfileScreenContent({ extraRows }: { extraRows?: ReactNode }) {
  const session = useSession();
  const profile = session.profile;
  const confirm = useConfirmModal();
  const [changingPassword, setChangingPassword] = useState(false);

  const initial = profile?.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const roleStyle = session.role ? ROLE_STYLES[session.role] : undefined;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : undefined;

  function confirmSignOut() {
    confirm({
      title: "Sign out?",
      message: "You'll need your mobile number and password to sign back in.",
      confirmText: "Sign out",
      destructive: true,
      onConfirm: async () => {
        try {
          await unregisterForPushNotifications();
        } catch (err) {
          console.warn("Failed to unregister push token during sign out:", err);
        }
        db.auth.signOut();
      },
    });
  }

  return (
    <ScrollView className="flex-1 bg-brand-gold-50" contentContainerClassName="gap-4 p-4 pb-48">
      <FadeSlideIn>
        <View className="overflow-hidden rounded-3xl" style={{ minHeight: 100 }}>
          <GradientView colors={theme.gradients.primary} className="absolute inset-0" />
          <Image
            source={require("@/assets/images/profile-jewelry.png")}
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60%" }}
            contentFit="cover"
          />
          <GradientView
            colors={[theme.teal.DEFAULT, theme.teal.DEFAULT, "transparent"]}
            locations={[0, 0.4, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            className="absolute inset-0"
          />
          <View className="flex-row items-center gap-4 p-6" style={{ minHeight: 100 }}>
            <View
              className="items-center justify-center rounded-full border-2 border-brand-gold-border"
              style={{ height: 90, width: 90, backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <AppText className="font-sans-bold text-4xl text-white">{initial}</AppText>
            </View>
            <View className="gap-2">
              <AppText className="font-sans-bold text-xl text-white">{profile?.name}</AppText>
              {roleStyle && (
                <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/20 px-3 py-1.5">
                  <ShieldCheck size={14} color="#fff" />
                  <AppText className="font-sans-medium text-xs text-white">{roleStyle.label}</AppText>
                </View>
              )}
            </View>
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={80}>
        <Card className="rounded-3xl p-2 px-4">
          <InfoRow icon={Phone} label="Mobile Number" value={profile?.mobile} copyable />
          <InfoRow icon={Building2} label="Branch" value={profile?.branch?.name} copyable />
          <InfoRow icon={Calendar} label="Member Since" value={memberSince} isLast />
        </Card>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <Pressable onPress={() => setChangingPassword(true)}>
          <Card className="flex-row items-center gap-3 rounded-3xl p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10">
              <Lock size={18} color={theme.teal.DEFAULT} />
            </View>
            <View className="flex-1">
              <AppText className="font-sans-bold text-base text-[#1c1c1e]">Change Password</AppText>
              <AppText className="font-sans text-sm text-[#9ca3af]">Update your account password</AppText>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Card>
        </Pressable>
      </FadeSlideIn>

      {extraRows && <FadeSlideIn delay={160}>{extraRows}</FadeSlideIn>}

      <Button variant="destructiveOutline" icon={LogOut} onPress={confirmSignOut} className="mt-2">
        Sign out
      </Button>

      <ChangePasswordModal visible={changingPassword} onClose={() => setChangingPassword(false)} />
    </ScrollView>
  );
}
