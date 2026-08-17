import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useSession } from "@/contexts/SessionContext";

interface NotificationData {
  type?: string;
  logId?: string;
  requestId?: string;
}

// Routes a tapped push notification to the right in-app screen — mounted
// once near the root (see app/_layout.tsx) so it works no matter which
// screen happens to be on top when the tap arrives. Renders nothing.
export function NotificationRouter() {
  const router = useRouter();
  const session = useSession();

  // Read via a ref rather than closing over `session` directly — the
  // listener below is registered once (empty deps) so its closure would
  // otherwise always see the role from the very first render.
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // A tap that arrives before the session has resolved (cold start) gets
  // held here and flushed once it's ready — discount notifications route
  // differently depending on whether the signed-in user is the branch
  // manager or the owner, so it can't route without knowing the role yet.
  const pending = useRef<NotificationData | null>(null);

  function route(data: NotificationData) {
    const role = sessionRef.current.role;

    if (data.type === "visitor_assigned" && data.logId) {
      router.push({ pathname: "/(app)/salesperson/visits/[logId]", params: { logId: data.logId } });
      return;
    }

    if ((data.type === "discount_pending_otp" || data.type === "discount_applied") && data.requestId) {
      if (role === "branch_manager") {
        router.push({ pathname: "/(app)/manager/discounts/[discountId]", params: { discountId: data.requestId } });
      } else if (role === "owner") {
        router.push({ pathname: "/(app)/owner/discounts/[discountId]", params: { discountId: data.requestId } });
      }
    }
  }

  function handleResponse(data: NotificationData | undefined) {
    if (!data?.type) return;
    if (sessionRef.current.status === "ready") {
      route(data);
    } else {
      pending.current = data;
    }
  }

  useEffect(() => {
    // expo-notifications has no web implementation — same guard used for
    // registration in lib/push-notifications.ts.
    if (Platform.OS === "web") return;

    // Cold start: the app was launched by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      handleResponse(response?.notification.request.content.data as NotificationData | undefined);
    });

    // Warm: the app was already running when the notification was tapped.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleResponse(response.notification.request.content.data as NotificationData);
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session.status === "ready" && pending.current) {
      route(pending.current);
      pending.current = null;
    }
  }, [session.status]);

  return null;
}
