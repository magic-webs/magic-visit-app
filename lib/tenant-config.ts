// Strip a trailing slash so `${BASE_URL}/organizations/lookup` can't end up
// as `//organizations/lookup`.
const BASE_URL = process.env.EXPO_PUBLIC_AUTH_BRIDGE_URL!.replace(/\/+$/, "");
const TENANT_SLUG = process.env.EXPO_PUBLIC_TENANT_SLUG!;

export interface RemoteThemeBaseTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  destructive: string;
}

export interface TenantConfigResponse {
  id: string;
  name: string;
  status: string;
  theme: { font: string; radius: number; light: RemoteThemeBaseTokens; dark: RemoteThemeBaseTokens } | null;
  branding: {
    appName: string;
    shortName: string | null;
    logoLightUrl: string | null;
    logoDarkUrl: string | null;
    iconUrl: string | null;
    customDomain: string | null;
  } | null;
}

// Public, unauthenticated endpoint — safe to call before sign-in, which is
// when the login screen needs it to show the right logo/colors.
export async function fetchTenantConfig(): Promise<TenantConfigResponse> {
  const res = await fetch(`${BASE_URL}/organizations/lookup?slug=${encodeURIComponent(TENANT_SLUG)}`);
  if (!res.ok) {
    throw new Error(`Failed to load tenant config (${res.status})`);
  }
  return res.json();
}
