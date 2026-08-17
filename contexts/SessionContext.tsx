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
    role: undefined,
    branchId: undefined,
    availabilityId: undefined,
    availabilityStatus: undefined,
  };
}

const SessionContext = createContext<SessionValue>(emptySession("checking"));

export function SessionProvider({ children }: { children: ReactNode }) {
  const auth = db.useAuth();

  // The query argument (not the hook call) is what's conditional — this is
  // the sanctioned way to defer an InstantDB query until we have a user id.
  // Note: useQuery(null) reports isLoading: true forever, so auth.isLoading
  // and !auth.user must both be checked before this hook's isLoading is
  // trusted.
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
      // The client SDK has our schema attached (see lib/db.ts), so it knows
      // `branch`/`availability` are "has one" links and returns them as
      // singular objects — unlike the auth-bridge Worker's schema-less admin
      // queries, which always render links as arrays regardless of
      // cardinality (see auth-bridge/src/routes/staff.routes.ts's firstId()).
      value = {
        status: "ready",
        userId: auth.user.id,
        profile,
        profileId: profile.id,
        role: profile.role as StaffRole,
        branchId: profile.branch?.id,
        availabilityId: profile.availability?.id,
        availabilityStatus: profile.availability?.availabilityStatus as SessionValue["availabilityStatus"],
      };
    }
  }

  // Registering is idempotent (it just overwrites the profile's stored
  // token), so re-running on every fresh sign-in is fine — this only ever
  // needs a live session, never a specific render.
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
