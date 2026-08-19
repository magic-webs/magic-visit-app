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
  // Keeps the ~25 direct (non-Tailwind-class) theme.teal/theme.gradients.primary
  // readers in sync — see constants/theme.ts's applyResolvedBrandColors.
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

// EXPO_PUBLIC_BAKED_TENANT_CONFIG is written at build time by
// scripts/sync-tenant-branding.js (base64 tenant theme+branding, inlined into
// the JS bundle via the EXPO_PUBLIC_ prefix) so the app boots with the real
// theme instead of flashing DEFAULT_RESOLVED_BRAND before the runtime fetch
// resolves — most visible on static web/PWA with no splash screen to hide it.
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
// Computed once at module load, which also fires applyResolvedBrandColors()
// before any component mounts, so direct theme.* consumers start correct too.
const defaultValue: TenantConfigValue = bakedConfig
  ? { ...resolve(bakedConfig), isLoading: true }
  : { brand: DEFAULT_RESOLVED_BRAND, branding: DEFAULT_BRANDING, isLoading: true };

const TenantConfigContext = createContext<TenantConfigValue>(defaultValue);

// Fetches this build's tenant (theme + branding) once at startup via a plain
// REST call (a tenant's brand rarely changes, and this works pre-login).
// Paints from the build-time-baked config, then AsyncStorage cache, then the
// hardcoded fallback, in that priority — the live fetch below always still
// runs, to catch any change made in the panel since.
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
        // Offline / bridge unreachable — keep whatever's already painted.
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
