import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { id } from "@instantdb/react-native";
import { registerPushToken, unregisterPushToken } from "@/lib/auth-bridge";

const DEVICE_ID_KEY = "urmil_device_id";

// A stable id for this install, independent of which staff member is signed
// in — generated once and persisted, so re-registering (app foreground,
// sign out/in as someone else on the same phone) upserts the same `devices`
// row instead of creating a new one every time. Not the same thing as an
// Expo push token, which can itself change (reinstall, OS-level reset).
async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = id();
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

// Foreground behavior — without this, notifications received while the app
// is open never surface a banner/sound (Expo's default handler is silent).
// expo-notifications has no web implementation for this, so it's guarded
// the same way registerForPushNotifications is below.
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

// Requests permission, fetches this device's Expo push token, and registers
// this device (and its token) against the signed-in staff member's profile.
// Safe to call every time the app foregrounds with an active session —
// registration is idempotent (upserts the same `devices` row by deviceId).
// Push notifications are mobile-only (Android/iOS) and require a native EAS
// build — never a fatal path, so every failure here is swallowed rather than
// surfaced.
export async function registerForPushNotifications(): Promise<void> {
  // No push support in the web dev preview this project is also served
  // from — Expo's web push path needs its own (unconfigured) VAPID setup.
  if (Platform.OS === "web") return;

  try {
    await ensureAndroidChannel();

    // Push tokens don't exist on iOS simulators — nothing to register.
    // Android emulators with Google Play services do support push tokens.
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
