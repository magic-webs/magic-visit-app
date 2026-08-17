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
function approximateHexFromOklch(oklchString) {
  const { oklchToHex, parseOklch } = require("../lib/theme/oklch");
  try {
    return oklchToHex(parseOklch(oklchString));
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

  if (changed) {
    fs.writeFileSync(ENV_PATH, next);
    console.log(".env updated.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
