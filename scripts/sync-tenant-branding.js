// Pulls this build's tenant (EXPO_PUBLIC_TENANT_SLUG) current appName/theme
// color from the auth-bridge's public lookup endpoint (the same one
// contexts/TenantConfigContext.tsx uses at runtime) and writes APP_NAME /
// NOTIFICATION_COLOR into .env, so app.config.js's build-time fields stay in
// sync with whatever's been configured in magic-visit-panel, without
// hand-copying values before every build.
//
// Real process env vars (e.g. set by a CI runner/GitHub Actions step)
// always win over whatever's already in .env, and a missing .env file
// (a fresh CI checkout never has one — it's gitignored) is fine as long as
// EXPO_PUBLIC_AUTH_BRIDGE_URL/EXPO_PUBLIC_TENANT_SLUG arrive via process.env
// instead — see .github/workflows/eas-build.yml for that path.
//
// Local dev, run before `expo prebuild` / `eas build`:
//   node scripts/sync-tenant-branding.js

const fs = require("node:fs");
const path = require("node:path");

const ENV_PATH = path.join(__dirname, "..", ".env");
const ASSETS_DIR = path.join(__dirname, "..", "assets", "images");
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const MANIFEST_PATH = path.join(PUBLIC_DIR, "manifest.json");

const EXT_BY_CONTENT_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

// app.config.js's ICON_PATH/ADAPTIVE_ICON_PATH/FAVICON_PATH need real LOCAL
// files — Expo's build pipeline actually processes/resizes them — but a
// tenant's uploaded icon/logo only exists as a remote InstantDB $files URL.
// Without this, those fields always fall back to the hardcoded default
// icon regardless of what a tenant uploaded in the panel, which is the
// exact "favicon is the default, not the one I selected" bug. Downloads the
// tenant's icon (falling back to their light logo if no dedicated icon was
// uploaded) to a local file once per build, so app.config.js can point at
// it like any other asset.
async function downloadTenantIcon(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Icon download failed (${res.status})`);
  const contentType = (res.headers.get("content-type") || "").split(";")[0].trim();
  const ext = EXT_BY_CONTENT_TYPE[contentType] || "png";
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const filePath = path.join(ASSETS_DIR, `tenant-icon.${ext}`);
  fs.writeFileSync(filePath, buffer);

  // web.favicon in app.config.js only feeds Expo's classic webpack build —
  // the actual static web export (app/+html.tsx, output: "static") serves
  // public/favicon.png etc. verbatim, completely independent of that config
  // field. Without overwriting these too, the browser tab/PWA install icon
  // always stays the hardcoded default no matter what a tenant uploads —
  // this is the literal "favicon is not change" bug. Raster formats
  // (png/jpg/webp) are safe to drop in under the existing .png filenames —
  // browsers sniff icon bytes rather than trust the extension — but an SVG
  // upload genuinely wouldn't render under a mismatched extension, so skip
  // rather than serve a broken icon.
  if (ext !== "svg") {
    fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.png"), buffer);
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon-192.png"), buffer);
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon-512.png"), buffer);
  } else {
    console.log("Tenant icon is an SVG — leaving public/favicon.png and friends as the default (no safe raster to drop in).");
  }

  // app.config.js expects paths relative to the project root, "./assets/...".
  return `./assets/images/tenant-icon.${ext}`;
}

// public/manifest.json drives "Add to Home Screen"/PWA install — like the
// favicon, it's a static file copied verbatim into the export output, so a
// tenant's app name/short name/theme color need to be written into it here
// rather than relying on any app.config.js field.
function syncManifest({ appName, shortName, themeColorHex }) {
  if (!fs.existsSync(MANIFEST_PATH)) return;
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  if (appName) {
    manifest.name = appName;
    manifest.short_name = shortName || appName;
  }
  if (themeColorHex) manifest.theme_color = themeColorHex;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return { text: "", values: {} };
  const text = fs.readFileSync(ENV_PATH, "utf8");
  const values = {};
  for (const line of text.split("\n")) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match) values[match[1]] = match[2];
  }
  return { text, values };
}

function upsertEnvVar(text, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(text)) return text.replace(re, line);
  return `${text.trimEnd()}\n${line}\n`;
}

// Very rough hex-primary extraction from an oklch() base token — this is a
// best-effort sync helper, not the real theming pipeline (that's
// lib/theme/derive-brand-vars.ts, used at runtime) — good enough to get a
// notification-icon color roughly in the right ballpark for a build-time
// field that most tenants won't scrutinize pixel-for-pixel.
//
// Deliberately NOT requiring lib/theme/oklch.ts here — that's a TypeScript
// module, and this script runs under plain `node` (no ts-node/register
// hook, in CI or locally), so a bare `require()` of a .ts file always fails
// with MODULE_NOT_FOUND. This is a small, self-contained plain-JS port of
// just the OKLCH->sRGB math actually needed here (same source: Björn
// Ottosson's OKLab reference, https://bottosson.github.io/posts/oklab/).
function approximateHexFromOklch(oklchString) {
  try {
    const match = /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i.exec(oklchString.trim());
    if (!match) return null;
    const l = Number(match[1]);
    const c = Number(match[2]);
    const h = (Number(match[3]) * Math.PI) / 180;

    const a = c * Math.cos(h);
    const b = c * Math.sin(h);

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;
    const l3 = l_ ** 3;
    const m3 = m_ ** 3;
    const s3 = s_ ** 3;

    const linear = {
      r: +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
      g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
      b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
    };

    const gamma = (v) => {
      const clamped = Math.min(1, Math.max(0, v));
      return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
    };
    const toHex2 = (v) =>
      Math.round(Math.min(255, Math.max(0, gamma(v) * 255)))
        .toString(16)
        .padStart(2, "0");

    return `#${toHex2(linear.r)}${toHex2(linear.g)}${toHex2(linear.b)}`;
  } catch {
    return null;
  }
}

async function main() {
  const { text, values } = readEnvFile();
  // process.env wins over .env — this is what lets a CI runner (no .env
  // file at all) drive this via plain step-level env vars.
  const bridgeUrl = (
    process.env.EXPO_PUBLIC_AUTH_BRIDGE_URL ||
    values.EXPO_PUBLIC_AUTH_BRIDGE_URL ||
    "http://localhost:8787"
  ).replace(/\/+$/, "");
  const tenantSlug = process.env.EXPO_PUBLIC_TENANT_SLUG || values.EXPO_PUBLIC_TENANT_SLUG;

  if (!tenantSlug) {
    console.error("EXPO_PUBLIC_TENANT_SLUG isn't set (checked process.env and .env) — nothing to sync.");
    process.exit(1);
  }

  const res = await fetch(`${bridgeUrl}/organizations/lookup?slug=${encodeURIComponent(tenantSlug)}`);
  if (!res.ok) {
    console.error(`Lookup failed (${res.status}) — is the auth-bridge running at ${bridgeUrl}?`);
    process.exit(1);
  }
  const data = await res.json();

  let next = text;
  let changed = false;

  if (data.branding?.appName) {
    next = upsertEnvVar(next, "APP_NAME", data.branding.appName);
    changed = true;
    console.log(`APP_NAME=${data.branding.appName}`);
  } else {
    console.log("No branding configured for this tenant yet — APP_NAME left as-is.");
  }

  const primary = data.theme?.light?.primary;
  const hex = primary ? approximateHexFromOklch(primary) : null;
  if (hex) {
    next = upsertEnvVar(next, "NOTIFICATION_COLOR", hex);
    changed = true;
    console.log(`NOTIFICATION_COLOR=${hex}`);
  } else {
    console.log("No theme configured for this tenant yet — NOTIFICATION_COLOR left as-is.");
  }

  const iconSourceUrl = data.branding?.iconUrl || data.branding?.logoLightUrl;
  if (iconSourceUrl) {
    try {
      const iconPath = await downloadTenantIcon(iconSourceUrl);
      next = upsertEnvVar(next, "ICON_PATH", iconPath);
      next = upsertEnvVar(next, "ADAPTIVE_ICON_PATH", iconPath);
      next = upsertEnvVar(next, "FAVICON_PATH", iconPath);
      changed = true;
      console.log(`ICON_PATH=ADAPTIVE_ICON_PATH=FAVICON_PATH=${iconPath} (downloaded from ${iconSourceUrl})`);
    } catch (err) {
      console.error(`Icon download failed, leaving ICON_PATH/FAVICON_PATH as-is: ${err.message}`);
    }
  } else {
    console.log("No icon or logo uploaded for this tenant yet — ICON_PATH/FAVICON_PATH left as-is.");
  }

  syncManifest({ appName: data.branding?.appName, shortName: data.branding?.shortName, themeColorHex: hex });
  console.log("public/manifest.json synced.");

  // Bakes the FULL tenant config (theme + branding, same shape
  // TenantConfigContext fetches at runtime) into the JS bundle as this
  // build's starting values — the EXPO_PUBLIC_ prefix means Expo inlines it
  // at build time, same mechanism as EXPO_PUBLIC_INSTANT_APP_ID etc. This is
  // what fixes the "shows the default, THEN the real theme" flash on
  // refresh: without it, the app always boots from the hardcoded fallback
  // and only shows the real theme once the runtime fetch resolves, which is
  // especially visible on a static web/PWA build with no native splash
  // screen holding the seam. With it, the very first paint already has the
  // real values; the runtime fetch still runs afterward, but only to catch
  // any change made in the panel since this build was made — it won't
  // visibly overwrite anything in the common case where nothing changed.
  // Base64-encoded to keep it a safe single-line .env value (raw JSON has
  // quotes/braces that don't survive a plain-text .env file reliably).
  const baked = Buffer.from(JSON.stringify(data), "utf8").toString("base64");
  next = upsertEnvVar(next, "EXPO_PUBLIC_BAKED_TENANT_CONFIG", baked);
  changed = true;
  console.log(`EXPO_PUBLIC_BAKED_TENANT_CONFIG=<${baked.length} bytes, base64>`);

  if (changed) {
    fs.writeFileSync(ENV_PATH, next);
    console.log(".env updated.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
