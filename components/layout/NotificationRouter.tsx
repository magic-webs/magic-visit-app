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

// Mounted once near the root (see app/_layout.tsx) so it works regardless of which screen is on top when the tap arrives.
export function NotificationRouter() {
  const router = useRouter();
  const session = useSession();

  // Ref instead of closing over `session`: the listener below has empty deps, so a closure would only ever see the first render's role.
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Holds a tap that arrives before the session resolves (cold start); discount routes depend on role, so it can't route until the role is known.
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
    // expo-notifications has no web implementation (same guard as lib/push-notifications.ts).
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
