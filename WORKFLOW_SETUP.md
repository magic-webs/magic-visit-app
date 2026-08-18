# CI workflow setup — APK builds & web/PWA deploys

Two GitHub Actions workflows exist in `.github/workflows/`, both triggerable manually (Actions tab → "Run workflow") or from `magic-visit-panel`'s branding page ("Create APK" / "Deploy web build" buttons):

| Workflow | File | Triggers | Produces |
|---|---|---|---|
| EAS Build | `eas-build.yml` | `tenant_slug`, `platform`, `profile` | An installable Android APK (or iOS build) via `eas build`, using the `preview` profile in `eas.json` (internal distribution, no store submission) |
| Web/PWA Deploy | `web-deploy.yml` | `tenant_slug`, `cloudflare_project` | A static web export (`expo export -p web`) deployed to Cloudflare Pages |

Both workflows pull the target tenant's current `appName`/brand color from the panel-managed config (`scripts/sync-tenant-branding.js`, hitting the auth-bridge's public `/organizations/lookup` endpoint) before building — so a build/deploy always reflects whatever's currently saved in the panel for that tenant, no manual copying needed.

## Prerequisite: the auth-bridge must be deployed publicly

Both workflows — and the mobile app itself, once installed — need to reach `magic-visit-auth-bridge` over the internet. If it's only running locally via `wrangler dev`, neither workflow can fetch tenant branding, and no *installed* app build can log in or read live data either. Deploy it first:

```bash
cd magic-visit-auth-bridge
npm run deploy   # wrangler deploy --minify
```

This gives you a URL like `https://magic-visit-auth-bridge.<your-subdomain>.workers.dev` (or a custom domain if configured) — that's the value used as `AUTH_BRIDGE_URL` below.

## 1. GitHub repo secrets (`magic-webs/magic-visit-app` → Settings → Secrets and variables → Actions)

| Secret | Used by | Value |
|---|---|---|
| `INSTANT_APP_ID` | both workflows | The shared InstantDB app id (same one in `magic-visit-auth-bridge/wrangler.jsonc`'s `INSTANT_APP_ID` var — not a secret in nature, just stored here for convenience) |
| `AUTH_BRIDGE_URL` | both workflows | The **deployed** auth-bridge URL from the prerequisite step above — never `http://localhost:8787`, that's unreachable from GitHub's/EAS's/Cloudflare's infrastructure |
| `EXPO_TOKEN` | `eas-build.yml` only | An Expo access token (expo.dev → Account Settings → Access Tokens) with permission to build this project, so `eas build --non-interactive` doesn't need an interactive login |
| `CLOUDFLARE_API_TOKEN` | `web-deploy.yml` only | A Cloudflare API token with `Cloudflare Pages:Edit` permission on your account |
| `CLOUDFLARE_ACCOUNT_ID` | `web-deploy.yml` only | Your Cloudflare account id (Cloudflare dashboard → right sidebar on any domain overview page, or `wrangler whoami`) |

## 2. Panel env vars (wherever `magic-visit-panel` runs — `.env.local` for local dev, your host's env config in production)

| Var | Purpose |
|---|---|
| `GITHUB_TOKEN` | A GitHub PAT that can dispatch workflow runs on `magic-webs/magic-visit-app` — a fine-grained token needs the repo explicitly selected with **Actions: Read and write** permission (Read-only isn't enough — dispatching a run is a write); a classic token needs the `workflow` scope (`repo`/`public_repo` alone isn't enough). Lets the panel dispatch either workflow. Leave unset to disable both "Create APK" and "Deploy web build" — they'll say so plainly instead of failing silently. |
| `MOBILE_REPO_OWNER` / `MOBILE_REPO_NAME` / `MOBILE_REPO_REF` | Already default to `magic-webs` / `magic-visit-app` / `main` — only change if the mobile app repo ever moves or you want to dispatch against a different branch |
| `NEXT_PUBLIC_EXPO_ACCOUNT` | Your expo.dev account/org slug — enables the "View builds on EAS" manual-fallback link (unrelated to the `GITHUB_TOKEN` automation, works independently) |

See `magic-visit-panel/.env.example` for the exact variable block.

## 3. Verifying it works

1. Confirm the auth-bridge is reachable: `curl https://<your-deployed-bridge-url>/` should return `{"ok":true,"service":"magic-visit-auth-bridge"}`.
2. From the panel's branding page for a tenant, click "Create APK" (or "Deploy web build"). You should see "Build/Deploy started — Watch its progress", linking to the workflow's Actions page.
3. If you get "Automated builds/deploys aren't configured yet" — `GITHUB_TOKEN` isn't set on the panel (or is invalid/lacks permission).
4. If the GitHub Actions run itself fails at the "Sync tenant branding" step — check `AUTH_BRIDGE_URL` is the real deployed URL and reachable from the internet, not `localhost`.
5. If `eas build`/`wrangler pages deploy` fails — check `EXPO_TOKEN` / `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` are valid and haven't expired.

## Running a build/deploy manually (without the panel)

GitHub → this repo → Actions tab → select "EAS Build (per tenant)" or "Deploy web/PWA (per tenant)" → "Run workflow" → fill in `tenant_slug` (and `platform`/`profile`, or `cloudflare_project`) → Run. Useful for testing the workflows themselves before wiring up the panel's `GITHUB_TOKEN`.
