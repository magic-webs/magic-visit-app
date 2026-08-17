import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { unregisterForPushNotifications } from "@/lib/push-notifications";

export default function NoAccessScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-brand-gold-50 px-6">
      <AppText className="font-sans-semibold text-xl text-[#1c1c1e]">No access yet</AppText>
      <AppText className="mt-2 text-center font-sans text-[#6b7280]">
        Your account isn&apos;t linked to a staff profile, or it has been deactivated. Contact your manager or the
        store owner to get set up.
      </AppText>
      <Button
        variant="outline"
        className="mt-6"
        onPress={async () => {
          try {
            await unregisterForPushNotifications();
          } catch {}
          db.auth.signOut();
        }}
      >
        Sign out
      </Button>
    </View>
  );
}
