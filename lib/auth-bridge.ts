import { db } from "@/lib/db";

// Strip a trailing slash so `${BASE_URL}/login` can't end up as `//login`.
const BASE_URL = process.env.EXPO_PUBLIC_AUTH_BRIDGE_URL!.replace(/\/+$/, "");
// The bridge is multi-tenant now — every build is scoped to one business.
// See .env.example; a later phase replaces this with a tenant picker screen.
const TENANT_SLUG = process.env.EXPO_PUBLIC_TENANT_SLUG!;

export class AuthBridgeError extends Error {}

// Logs in with mobile + password and completes the InstantDB sign-in. Throws
// AuthBridgeError with a user-facing message on invalid credentials or a
// deactivated account.
export async function loginWithMobile(mobile: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantSlug: TENANT_SLUG, mobile, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new AuthBridgeError(data?.error ?? "Something went wrong. Please try again.");
  }
  await db.auth.signInWithToken(data.token);
}

async function authedFetch<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const auth = await db.getAuth();
  const refreshToken = auth?.refresh_token;
  if (!refreshToken) {
    throw new AuthBridgeError("You're not signed in.");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    let errorMsg = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      errorMsg = data?.error ?? errorMsg;
    } catch {
      try {
        errorMsg = await res.text();
      } catch {}
    }
    throw new AuthBridgeError(errorMsg);
  }
  return (await res.json()) as T;
}

export interface CreateStaffInput {
  name: string;
  mobile: string;
  password: string;
  role: "owner" | "branch_manager" | "receptionist" | "salesperson" | "accountant";
  branchId?: string;
  email?: string;
  dob?: string;
  doa?: string;
  gender?: "male" | "female" | "other";
  hAndM?: string;
  employeeId?: string;
  managerId?: string;
  assignedSalespersonIds?: string[];
}

export interface UpdateStaffInput extends Partial<Omit<CreateStaffInput, "role">> {
  id: string;
  active?: boolean;
}

// Staff creation/editing always goes through the Worker (never a direct
// db.transact) — instant.perms.ts locks `profiles` writes to admin-SDK-only,
// since InstantDB's field-level permissions don't cleanly support scoping
// writes the way they scope reads (see instant.perms.ts for the full
// rationale).
export function createStaff(input: CreateStaffInput) {
  return authedFetch<{ id: string; name: string; mobile: string; role: string; branchId: string | null }>(
    "/staff",
    "POST",
    input,
  );
}

export function updateStaff(input: UpdateStaffInput) {
  return authedFetch<{ id: string; mobile: string }>("/staff", "PUT", input);
}

// Self-service — the caller's own password, not another staff member's (see
// StaffForm/updateStaff for that, which requires owner/branch_manager).
export function changeOwnPassword(password: string) {
  return authedFetch<{ id: string }>("/me/password", "PUT", { password });
}

export interface RegisterPushTokenInput {
  /** Per-install id generated once and persisted locally — see lib/push-notifications.ts. */
  deviceId: string;
  expoPushToken: string;
  platform?: "ios" | "android";
  deviceName?: string;
  osVersion?: string;
}

// Registers this device against the signed-in staff member's profile — see
// lib/push-notifications.ts for when this is called. Upserts by deviceId, so
// re-registering (app foreground, re-login) updates the same device rather
// than creating a duplicate.
export function registerPushToken(input: RegisterPushTokenInput) {
  return authedFetch<{ id: string }>("/me/push-token", "PUT", input);
}

export function unregisterPushToken(deviceId: string) {
  return authedFetch<{ success: boolean }>(`/me/push-token?deviceId=${encodeURIComponent(deviceId)}`, "DELETE");
}

export interface SendNotificationInput {
  toProfileIds?: string[];
  toRole?: "owner" | "branch_manager" | "receptionist" | "salesperson" | "accountant";
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Fires a push notification for an in-app event (e.g. a visitor assigned to
// a salesperson). Recipients are resolved server-side from either an
// explicit id list or a role broadcast — see notifications.routes.ts.
export function sendNotification(input: SendNotificationInput) {
  return authedFetch<{ sent: number }>("/notifications/send", "POST", input);
}

export interface CreateDiscountInput {
  visitorLogId: string;
  discountType: "percentage" | "amount";
  discountValue: number;
}

// Accountant-initiated discount authorization flow — see discounts.routes.ts.
// The OTP is generated server-side and never returned here; the branch
// manager reveals it in-app (revealDiscountOtp) and relays it verbally.
// `status` is "applied" immediately for a prime-member customer (no OTP
// step at all) or "pending_otp" otherwise.
export function createDiscount(input: CreateDiscountInput) {
  return authedFetch<{ id: string; status: "applied" | "pending_otp" }>("/discounts", "POST", input);
}

export interface RevealDiscountOtpResult {
  otp: string;
  discountType: "percentage" | "amount";
  discountValue: number;
  customerName: string | null;
  accountantName: string | null;
}

// Branch-manager-only — reveals the OTP for a still-pending discount request
// in their own branch so they can relay it to the accountant.
export function revealDiscountOtp(discountId: string) {
  return authedFetch<RevealDiscountOtpResult>(`/discounts/${discountId}/reveal-otp`, "POST");
}

// The accountant who created the request enters the code here.
export function verifyDiscountOtp(discountId: string, otp: string) {
  return authedFetch<{ id: string; status: "applied" }>(`/discounts/${discountId}/verify-otp`, "POST", { otp });
}

// Lets the initiating accountant back out of a still-pending request.
export function cancelDiscount(discountId: string) {
  return authedFetch<{ id: string; status: "cancelled" }>(`/discounts/${discountId}/cancel`, "POST");
}
