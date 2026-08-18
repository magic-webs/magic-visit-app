import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchTenantConfig, type TenantConfigResponse } from "@/lib/tenant-config";
import { deriveResolvedBrand, type ResolvedBrand } from "@/lib/theme/derive-brand-vars";
import { DEFAULT_RESOLVED_BRAND, DEFAULT_BRANDING } from "@/lib/theme/default-tenant-config";
import { applyResolvedBrandColors } from "@/constants/theme";
import { base64ToUtf8 } from "@/lib/base64";

const CACHE_KEY = "tenant_config_cache_v1";

export interface TenantBranding {
  appName: string;
  shortName: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  iconUrl: string | null;
  customDomain: string | null;
}

export interface TenantConfigValue {
  brand: ResolvedBrand;
  branding: TenantBranding;
  /** True until the first successful (or failed) network attempt resolves. */
  isLoading: boolean;
}

function resolve(data: TenantConfigResponse): Pick<TenantConfigValue, "brand" | "branding"> {
  const brand = data.theme ? deriveResolvedBrand(data.theme.light, data.theme.font) : DEFAULT_RESOLVED_BRAND;
  // See constants/theme.ts's applyResolvedBrandColors doc comment — this
  // keeps the ~25 call sites that read theme.teal/theme.gradients.primary
  // directly (not via a Tailwind class) in sync with whatever this tenant's
  // theme resolves to.
  applyResolvedBrandColors({
    primary: brand.navigation.primary,
    hover: brand.gradientPrimary[1],
    light: brand.gradientPrimary[2],
    edge: brand.buttonEdge,
    goldBorder: brand.goldBorderHex,
  });

  return {
    brand,
    branding: data.branding
      ? {
          appName: data.branding.appName,
          shortName: data.branding.shortName,
          logoLightUrl: data.branding.logoLightUrl,
          logoDarkUrl: data.branding.logoDarkUrl,
          iconUrl: data.branding.iconUrl,
          customDomain: data.branding.customDomain,
        }
      : DEFAULT_BRANDING,
  };
}

// EXPO_PUBLIC_BAKED_TENANT_CONFIG is written at BUILD time by
// scripts/sync-tenant-branding.js (base64 of this tenant's theme+branding,
// fetched from the auth-bridge right before `expo export`/`eas build`
// runs) and, because of the EXPO_PUBLIC_ prefix, gets inlined into the JS
// bundle as a literal string — no env var lookup happens on the device.
// This exists specifically to avoid a "shows the hardcoded default, THEN
// the real theme" flash on startup/refresh: without it, the app always
// boots from DEFAULT_RESOLVED_BRAND and only shows the tenant's real theme
// once the runtime fetch below resolves, which is especially visible on a
// static web/PWA build with no native splash screen to hide the seam.
function decodeBakedConfig(): TenantConfigResponse | null {
  const encoded = process.env.EXPO_PUBLIC_BAKED_TENANT_CONFIG;
  if (!encoded) return null;
  try {
    return JSON.parse(base64ToUtf8(encoded)) as TenantConfigResponse;
  } catch {
    return null;
  }
}

const bakedConfig = decodeBakedConfig();
// Computed once at module load (not per-render) — also fires
// applyResolvedBrandColors() immediately, before any component even
// mounts, so the ~25 direct theme.teal/theme.gradients.primary consumers
// start correct too, not just the CSS-variable-driven Tailwind classes.
const defaultValue: TenantConfigValue = bakedConfig
  ? { ...resolve(bakedConfig), isLoading: true }
  : { brand: DEFAULT_RESOLVED_BRAND, branding: DEFAULT_BRANDING, isLoading: true };

const TenantConfigContext = createContext<TenantConfigValue>(defaultValue);

// Fetches this build's tenant (theme + branding) once at startup — a
// tenant's brand rarely changes, so a single REST call (not a live InstantDB
// query) is enough, and it works before anyone has signed in, which the
// login screen needs. Starts from the build-time-baked config when one was
// produced (see decodeBakedConfig above — this is what's actually correct
// on first paint), then AsyncStorage cache (a more recent runtime fetch may
// have happened since this build), then the hardcoded fallback if neither
// exists — the live fetch below still runs regardless, to catch any change
// made in the panel since whichever of those was current.
export function TenantConfigProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<TenantConfigValue>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          setValue({ ...resolve(JSON.parse(cached) as TenantConfigResponse), isLoading: true });
        }
      } catch {
        // Corrupt cache entry — ignore, fall through to the network fetch.
      }

      try {
        const fresh = await fetchTenantConfig();
        if (cancelled) return;
        setValue({ ...resolve(fresh), isLoading: false });
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
      } catch {
        // Offline / bridge unreachable — keep whatever's already painted
        // (baked-in config, cache, or the hardcoded default) instead of
        // blocking on an error.
        if (!cancelled) setValue((prev) => ({ ...prev, isLoading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <TenantConfigContext.Provider value={value}>{children}</TenantConfigContext.Provider>;
}

export function useTenantConfig(): TenantConfigValue {
  return useContext(TenantConfigContext);
}
