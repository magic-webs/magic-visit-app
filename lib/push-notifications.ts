import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { id } from "@instantdb/react-native";
import { registerPushToken, unregisterPushToken } from "@/lib/auth-bridge";

const DEVICE_ID_KEY = "urmil_device_id";

// Stable per-install id, independent of which staff member is signed in —
// generated once and persisted so re-registering upserts the same `devices`
// row. Distinct from the Expo push token, which can itself change.
async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = id();
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

// Without this, notifications received while the app is foregrounded never
// surface a banner/sound (Expo's default handler is silent). No web impl.
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: "notification.wav",
    lightColor: "#097969",
  });
}

// Requests permission and registers this device's Expo push token against
// the signed-in staff member's profile. Safe to call on every foreground —
// idempotent via deviceId. Never fatal; failures are swallowed, not surfaced.
export async function registerForPushNotifications(): Promise<void> {
  // Expo's web push path needs its own (unconfigured) VAPID setup.
  if (Platform.OS === "web") return;

  try {
    await ensureAndroidChannel();

    // Push tokens don't exist on iOS simulators (Android emulators do).
    if (Platform.OS === "ios" && !Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("[Push] Permission not granted:", finalStatus);
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      "a632e0c4-6902-4d37-a9ad-f8d6c2089102";

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    const deviceId = await getDeviceId();
    await registerPushToken({
      deviceId,
      expoPushToken,
      platform: Platform.OS === "ios" ? "ios" : "android",
      deviceName: Device.deviceName ?? undefined,
      osVersion: Device.osVersion ?? undefined,
    });
  } catch (error) {
    console.warn("[Push] Error registering push token:", error);
  }
}

export async function unregisterForPushNotifications(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const deviceId = await getDeviceId();
    await unregisterPushToken(deviceId);
  } catch (error) {
    console.warn("[Push] Error unregistering push token:", error);
  }
}
