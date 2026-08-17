import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchTenantConfig, type TenantConfigResponse } from "@/lib/tenant-config";
import { deriveResolvedBrand, type ResolvedBrand } from "@/lib/theme/derive-brand-vars";
import { DEFAULT_RESOLVED_BRAND, DEFAULT_BRANDING } from "@/lib/theme/default-tenant-config";
import { applyResolvedBrandColors } from "@/constants/theme";

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

const defaultValue: TenantConfigValue = {
  brand: DEFAULT_RESOLVED_BRAND,
  branding: DEFAULT_BRANDING,
  isLoading: true,
};

const TenantConfigContext = createContext<TenantConfigValue>(defaultValue);

function resolve(data: TenantConfigResponse): Pick<TenantConfigValue, "brand" | "branding"> {
  const brand = data.theme ? deriveResolvedBrand(data.theme.light) : DEFAULT_RESOLVED_BRAND;
  // See constants/theme.ts's applyResolvedBrandColors doc comment — this
  // keeps the ~25 call sites that read theme.teal/theme.gradients.primary
  // directly (not via a Tailwind class) in sync with whatever this tenant's
  // theme resolves to.
  applyResolvedBrandColors({ primary: brand.navigation.primary, hover: brand.gradientPrimary[1], light: brand.gradientPrimary[2] });

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

// Fetches this build's tenant (theme + branding) once at startup — a
// tenant's brand rarely changes, so a single REST call (not a live InstantDB
// query) is enough, and it works before anyone has signed in, which the
// login screen needs. Paints instantly from the last successful fetch
// (cached in AsyncStorage) rather than blocking startup on the network, and
// falls back to the hardcoded current-production values (see
// lib/theme/default-tenant-config.ts) if nothing has ever loaded — so a
// fresh install with no connectivity still renders correctly.
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
        // (cache or the hardcoded default) instead of blocking on an error.
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
