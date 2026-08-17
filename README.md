# Urmil Jewellers — Ramnagar (Staff App)

An [Expo](https://docs.expo.dev/) / React Native app for Urmil Jewellers' Ramnagar branch(es) staff: visitor logging, follow-ups, sales tracking, discount approvals, and staff management, role-gated per account type. Backed by [InstantDB](https://www.instantdb.com/docs) with a companion Cloudflare Worker ([uj-ramnagar-auth-bridge](../uj-ramnagar-auth-bridge)) handling mobile-number + password login.

## Roles

Each staff profile has a `role` that determines which part of the app they land in after login (see `app/(app)/`):

| Role | Screens |
|---|---|
| `owner` | branches, staff (all), visitors, dashboard |
| `branch_manager` | staff (own branch), visitors, follow-ups, dashboard |
| `receptionist` | add visitor, visitors, follow-ups |
| `salesperson` | active visits, visitors, discount requests |
| `accountant` | discount request approvals, history |

Routing is handled by `app/index.tsx` + the `(app)/<role>/` route groups; `app/(auth)/` covers login and the "no access" screen for deactivated/unrecognized accounts.

## Architecture

- **Client**: Expo Router (file-based routing), NativeWind/Tailwind for styling, `@instantdb/react-native` for data — real-time queries, no separate REST layer for reads/writes that InstantDB permissions already allow.
- **Auth**: staff sign in with mobile number + password. Since InstantDB's client SDK only supports magic-code/email auth, sign-in goes through the [auth-bridge Worker](../uj-ramnagar-auth-bridge), which verifies the password and returns an InstantDB sign-in token that the client exchanges for a session.
- **Privileged writes**: creating/editing staff, changing another user's data, and sending push notifications also go through the auth-bridge Worker (via `EXPO_PUBLIC_AUTH_BRIDGE_URL`), since those actions need server-side authorization beyond what InstantDB permission rules alone can express.
- **Schema/permissions**: `instant.schema.ts` and `instant.perms.ts` at the project root define InstantDB's data model and access rules. Key entities: `profiles` (staff), `branches`, `customers`, `visitorLogs`, `salesRemarks`, `discountRequests`, `offers`, `salespersonAvailability`, `salespersonPerformance`, `devices` (push tokens).

## Setup

```bash
bun install
cp .env.example .env
```

Fill in `.env`:

```
EXPO_PUBLIC_INSTANT_APP_ID=<InstantDB app id>
INSTANT_APP_ADMIN_TOKEN=<InstantDB admin token>   # used by local scripts, not shipped in the app
EXPO_PUBLIC_AUTH_BRIDGE_URL=http://localhost:8787
```

`EXPO_PUBLIC_AUTH_BRIDGE_URL` must point at a running instance of [uj-ramnagar-auth-bridge](../uj-ramnagar-auth-bridge) (`npm run dev` there, from its own README). The right local URL depends on where the app runs:

- iOS simulator / web: `http://localhost:8787`
- Android emulator: `http://10.0.2.2:8787`
- Physical device: your machine's LAN IP, e.g. `http://192.168.x.x:8787`

## Development

```bash
bunx expo start        # dev server; press i/a/w or scan the QR code
bun run android
bun run ios
bun run web
bun run lint
```

### InstantDB schema/permissions

```bash
bunx instant-cli push schema --yes   # push instant.schema.ts changes
bunx instant-cli push perms --yes    # push instant.perms.ts changes
bunx instant-cli pull --yes          # pull remote schema/perms into local files
```

### White-label / build-time branding

`app.json` was replaced with `app.config.js`, which reads name/slug/scheme/bundle id/icon paths/notification color from env vars (see `.env.example`), defaulting to today's values if unset. Set them per EAS build profile to produce a differently-branded build from this same source tree, or run `npm run sync-tenant-branding` first to pull the current name/brand color for `EXPO_PUBLIC_TENANT_SLUG` from the panel-managed config automatically. This is separate from the *runtime* theme/branding in `contexts/TenantConfigContext.tsx`, which affects what's drawn on screen after install, not the build itself.

## Notes

- `AGENTS.md` documents InstantDB usage conventions for AI coding agents working in this repo — not user-facing app documentation.
- Push notifications use Expo's push service; devices register their push token with the auth-bridge Worker (`PUT /me/push-token`) on sign-in/foreground.
