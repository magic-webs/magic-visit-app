import { createContext, useContext, useEffect, type ReactNode } from "react";
import { db } from "@/lib/db";
import { registerForPushNotifications } from "@/lib/push-notifications";
import type { StaffRole } from "@/constants/theme";

export type SessionStatus = "checking" | "signed-out" | "no-profile" | "ready";

export interface SessionValue {
  status: SessionStatus;
  userId: string | undefined;
  profile: any | undefined;
  profileId: string | undefined;
  tenantId: string | undefined;
  role: StaffRole | undefined;
  branchId: string | undefined;
  availabilityId: string | undefined;
  availabilityStatus: "available" | "busy" | "offline" | undefined;
}

function emptySession(status: SessionStatus, userId?: string): SessionValue {
  return {
    status,
    userId,
    profile: undefined,
    profileId: undefined,
    tenantId: undefined,
    role: undefined,
    branchId: undefined,
    availabilityId: undefined,
    availabilityStatus: undefined,
  };
}

const SessionContext = createContext<SessionValue>(emptySession("checking"));

export function SessionProvider({ children }: { children: ReactNode }) {
  const auth = db.useAuth();

  // Query argument (not the hook call) is conditional — the sanctioned way to
  // defer an InstantDB query until there's a user id. useQuery(null) reports
  // isLoading: true forever, so auth.isLoading/!auth.user are checked below
  // instead of trusting this hook's isLoading directly.
  const { data, isLoading: profileLoading } = db.useQuery(
    auth.user
      ? {
          profiles: {
            $: { where: { "$user.id": auth.user.id } },
            branch: {},
            availability: {},
          },
        }
      : null,
  );

  let value: SessionValue;

  if (auth.isLoading) {
    value = emptySession("checking");
  } else if (!auth.user) {
    value = emptySession("signed-out");
  } else if (profileLoading) {
    value = emptySession("checking", auth.user.id);
  } else {
    const profile = data?.profiles?.[0];
    if (!profile || !profile.active) {
      value = emptySession("no-profile", auth.user.id);
    } else {
      // Client SDK has the schema attached (lib/db.ts), so it knows
      // branch/availability are "has one" links and returns singular objects
      // — unlike the auth-bridge's schema-less admin queries, which always
      // render links as arrays (see staff.routes.ts's firstId()).
      value = {
        status: "ready",
        userId: auth.user.id,
        profile,
        profileId: profile.id,
        tenantId: profile.tenantId,
        role: profile.role as StaffRole,
        branchId: profile.branch?.id,
        availabilityId: profile.availability?.id,
        availabilityStatus: profile.availability?.availabilityStatus as SessionValue["availabilityStatus"],
      };
    }
  }

  // Idempotent (overwrites the profile's stored token), so re-running on
  // every fresh sign-in is fine.
  const profileId = value.profileId;
  useEffect(() => {
    if (profileId) {
      registerForPushNotifications();
    }
  }, [profileId]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
