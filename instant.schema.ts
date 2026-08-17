// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),

    // A tenant business ("Urmil Jewellers", etc). No outbound links — every
    // tenant-scoped entity points back here via a flat, indexed `tenantId`
    // field (not a link), so every instant.perms.ts rule only needs one
    // cheap scalar-equality conjunct rather than a graph traversal. Mutated
    // only by the auth-bridge Worker via the admin SDK.
    organizations: i.entity({
      name: i.string(),
      slug: i.string().unique().indexed(),
      status: i.string().indexed(), // active | suspended | trial | cancelled
      plan: i.string().indexed().optional(),
      // Synthetic-email namespace for this tenant's staff logins — see
      // auth-bridge/src/lib/syntheticEmail.ts. Deliberately NOT derived from
      // slug/tenantId at read time so an existing tenant's already-issued
      // $user emails never change.
      authEmailDomain: i.string().indexed(),
      primaryContactEmail: i.string().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date(),
    }),

    // Tenant-owned, data-driven roles (replaces the old hardcoded StaffRole
    // union). `inheritsScopeFrom` is one of the 5 fixed structural keys
    // (owner/branch_manager/receptionist/salesperson/accountant) and is the
    // only part of a role InstantDB's CEL rules can see (see instant.perms.ts)
    // — CEL can reliably traverse to a linked row's scalar field, but can't
    // test membership inside a linked row's `permissions` json array, so
    // fine-grained capability checks happen only in the auth-bridge.
    roles: i.entity({
      tenantId: i.string().indexed(),
      key: i.string().indexed(), // unique per tenant — enforced in the bridge, not schema-global
      name: i.string(),
      inheritsScopeFrom: i.string().indexed(),
      permissions: i.json(), // string[] of capability keys, e.g. "can_manage_staff"
      isSystem: i.boolean().indexed(),
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date(),
    }),

    // Vendor/agency console identity — distinct from `profiles` (tenant
    // staff) on purpose. A panelOperator never links to a `profiles` row, so
    // every `sameTenant`-gated rule below is automatically false for them by
    // construction; their own read access is granted through explicit
    // `isSuperAdminOperator`/`isScopedOperator` binds instead, and every
    // mutation goes through dedicated auth-bridge routes.
    panelOperators: i.entity({
      name: i.string(),
      email: i.string().unique().indexed(),
      passwordHash: i.string(),
      role: i.string().indexed(), // super_admin | tenant_admin
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
    }),

    // One row per tenant. Editable base tokens live in `light`/`dark`; every
    // other shadcn CSS variable (card/popover/muted/border/chart-1..5/
    // sidebar-*) is derived from these at read time by the panel's
    // lib/theme/derive-theme.ts — never stored redundantly here.
    themes: i.entity({
      tenantId: i.string().unique().indexed(),
      isPreset: i.boolean(),
      presetKey: i.string().optional(),
      font: i.string(),
      radius: i.number(),
      light: i.json(), // ThemeBaseTokens
      dark: i.json(), // ThemeBaseTokens
      updatedAt: i.date(),
    }),

    branding: i.entity({
      tenantId: i.string().unique().indexed(),
      appName: i.string(),
      shortName: i.string().optional(),
      logoLightFileId: i.string().optional(),
      logoDarkFileId: i.string().optional(),
      iconFileId: i.string().optional(),
      // Custom hosting domain for this tenant's web/PWA build (e.g.
      // "app.urmiljewellers.com"). Stored for use by the web shell
      // (title/manifest/canonical URL) and any future custom-domain hosting
      // automation — DNS/certificate provisioning itself is out of scope
      // here, this is just the tenant's declared intent.
      customDomain: i.string().optional(),
      updatedAt: i.date(),
    }),

    // Staff identity (owner/branch_manager/receptionist/salesperson/accountant).
    // Mutated only by the auth-bridge Worker via the admin SDK — see instant.perms.ts.
    profiles: i.entity({
      name: i.string(),
      // No longer globally unique — two different tenants' staff can share a
      // mobile number. Uniqueness is enforced in the bridge as a
      // (tenantId, mobile) compound check, same treatment as employeeId below.
      mobile: i.string().indexed(),
      email: i.string().optional(),
      passwordHash: i.string(),
      dob: i.string().optional(),
      doa: i.string().optional(),
      gender: i.string().optional(),
      hAndM: i.string().optional(),
      // Legacy string role, kept during the roles-table migration as a
      // rollback safety net. `roleId`/the `role` link below is the field
      // everything new reads from; drop this once migration has run clean
      // for a release cycle.
      role: i.string().indexed(),
      roleId: i.string().indexed(),
      active: i.boolean().indexed(),
      employeeId: i.string().indexed().optional(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date(),
    }),

    branches: i.entity({
      name: i.string(),
      location: i.string(),
      phone: i.string().optional(),
      active: i.boolean().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
    }),

    customers: i.entity({
      name: i.string(),
      // No longer globally unique — see profiles.mobile comment above.
      mobile: i.string().indexed(),
      email: i.string().indexed().optional(),
      gender: i.string().optional(),
      hAndM: i.string().optional(),
      dob: i.string().optional(),
      doa: i.string().optional(),
      address: i.string().optional(),
      type: i.string().indexed(),
      // Prime members get a preset discount the accountant can apply
      // instantly, with no branch-manager OTP step — see discounts.routes.ts.
      isPrimeMember: i.boolean().indexed().optional(),
      primeDiscountType: i.string().optional(),
      primeDiscountValue: i.number().optional(),
      tenantId: i.string().indexed(),
    }),

    // One row per physical visit. `status` is the CRM outcome (unchanged
    // vocabulary from the source app); `assignmentStatus` tracks the
    // salesperson accept/decline lifecycle, kept separate so it never
    // collides with the outcome vocabulary.
    visitorLogs: i.entity({
      status: i.string().indexed(),
      assignmentStatus: i.string().indexed(),
      serialNumber: i.number().indexed(),
      visitedAt: i.date().indexed(),
      followUpDate: i.string().optional().indexed(),
      purpose: i.string().optional(),
      tenantId: i.string().indexed(),
    }),

    salesRemarks: i.entity({
      remark: i.string(),
      budget: i.string().optional(),
      followUpDate: i.string().optional().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
    }),

    // Accountant-initiated, branch-manager-OTP-authorized discount workflow.
    // `otp` is never readable by any client role (see instant.perms.ts) —
    // only the auth-bridge Worker (admin SDK) generates/reads/verifies it.
    // `otp`/`otpAttempts` are optional because a prime-member discount is
    // applied instantly and never generates an OTP at all.
    discountRequests: i.entity({
      discountType: i.string(),
      discountValue: i.number(),
      otp: i.string().optional(),
      otpAttempts: i.number().optional(),
      status: i.string().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
      appliedAt: i.date().optional().indexed(),
    }),

    // Master offers catalog (owner-managed). No spin-wheel/probability field —
    // deferred with the customer-facing portal.
    offers: i.entity({
      title: i.string(),
      description: i.string().optional(),
      type: i.string(),
      value: i.number(),
      trigger: i.string().indexed(),
      active: i.boolean().indexed(),
      tenantId: i.string().indexed(),
      expiresAt: i.date().optional().indexed(),
      createdAt: i.date().indexed(),
    }),

    performanceRanges: i.entity({
      minPoints: i.number().indexed(),
      maxPoints: i.number(),
      color: i.string(),
      label: i.string(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
    }),

    salespersonPerformance: i.entity({
      points: i.number(),
      month: i.string().indexed(),
      tenantId: i.string().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Split out from `profiles` so it can safely allow direct client self-updates
    // (nothing sensitive lives here) — see instant.perms.ts for why `profiles`
    // itself never accepts client writes. Red/green availability lives here.
    salespersonAvailability: i.entity({
      availabilityStatus: i.string().indexed(),
      tenantId: i.string().indexed(),
      statusChangedAt: i.date().indexed(),
    }),

    // One row per physical install, not per login — `deviceId` is a UUID the
    // client generates once and persists locally (see lib/push-notifications.ts),
    // so signing out and back in on the same phone updates the existing row
    // (and re-links it to whichever profile is now signed in) instead of
    // piling up duplicates. Written only via PUT /me/push-token (auth-bridge
    // Worker, admin SDK) — never a direct client write, same as `profiles`.
    devices: i.entity({
      deviceId: i.string().unique().indexed(),
      expoPushToken: i.string().indexed(),
      platform: i.string().optional(),
      deviceName: i.string().optional(),
      osVersion: i.string().optional(),
      tenantId: i.string().indexed(),
      lastActiveAt: i.date().indexed(),
      createdAt: i.date().indexed(),
    }),
  },
  rooms: {},
  links: {
    profilesUser: {
      forward: { on: "profiles", has: "one", label: "$user" },
      reverse: { on: "$users", has: "one", label: "profile" },
    },
    // Named `assignedRole`, not `role` — the legacy `profiles.role` string
    // field (kept as a rollback safety net during migration, see the schema
    // comment above) already owns that name, and the current mobile app
    // reads it directly today. Everything new (instant.perms.ts CEL rules,
    // the auth-bridge) reads through this link instead.
    profilesRole: {
      forward: { on: "profiles", has: "one", label: "assignedRole" },
      reverse: { on: "roles", has: "many", label: "profiles" },
    },
    panelOperatorsUser: {
      forward: { on: "panelOperators", has: "one", label: "$user" },
      reverse: { on: "$users", has: "one", label: "panelOperator" },
    },
    // A panelOperator's tenant scope, as a real link rather than a json
    // array field — CEL can reliably test "x in auth.ref(...)" membership
    // across a linked-row set (the same pattern already used below for
    // assignedSalespersons/assignedReceptionists), but not against values
    // packed inside a json blob field.
    panelOperatorOrganizations: {
      forward: { on: "panelOperators", has: "many", label: "organizations" },
      reverse: { on: "organizations", has: "many", label: "panelOperators" },
    },
    profilesBranch: {
      forward: { on: "profiles", has: "one", label: "branch" },
      reverse: { on: "branches", has: "many", label: "staff" },
    },
    branchManager: {
      forward: { on: "branches", has: "one", label: "manager" },
      reverse: { on: "profiles", has: "many", label: "managedBranches" },
    },
    profilesManager: {
      forward: { on: "profiles", has: "one", label: "manager" },
      reverse: { on: "profiles", has: "many", label: "directReports" },
    },
    profilesAssignment: {
      forward: { on: "profiles", has: "many", label: "assignedSalespersons" },
      reverse: { on: "profiles", has: "many", label: "assignedReceptionists" },
    },
    profileAvailability: {
      forward: { on: "salespersonAvailability", has: "one", label: "profile" },
      reverse: { on: "profiles", has: "one", label: "availability" },
    },
    customersBranch: {
      forward: { on: "customers", has: "one", label: "branch" },
      reverse: { on: "branches", has: "many", label: "customers" },
    },
    customersSalesperson: {
      forward: { on: "customers", has: "one", label: "salesperson" },
      reverse: { on: "profiles", has: "many", label: "registeredCustomers" },
    },
    visitorLogsCustomer: {
      forward: { on: "visitorLogs", has: "one", label: "customer", onDelete: "cascade" },
      reverse: { on: "customers", has: "many", label: "visitorLogs" },
    },
    visitorLogsBranch: {
      forward: { on: "visitorLogs", has: "one", label: "branch" },
      reverse: { on: "branches", has: "many", label: "visitorLogs" },
    },
    visitorLogsReceptionist: {
      forward: { on: "visitorLogs", has: "one", label: "receptionist" },
      reverse: { on: "profiles", has: "many", label: "receptionistLogs" },
    },
    visitorLogsSalesperson: {
      forward: { on: "visitorLogs", has: "one", label: "salesperson" },
      reverse: { on: "profiles", has: "many", label: "salespersonLogs" },
    },
    salesRemarksVisitorLog: {
      forward: { on: "salesRemarks", has: "one", label: "visitorLog", onDelete: "cascade" },
      reverse: { on: "visitorLogs", has: "many", label: "remarks" },
    },
    salesRemarksAuthor: {
      forward: { on: "salesRemarks", has: "one", label: "author" },
      reverse: { on: "profiles", has: "many", label: "authoredRemarks" },
    },
    discountRequestsVisitorLog: {
      forward: { on: "discountRequests", has: "one", label: "visitorLog", onDelete: "cascade" },
      reverse: { on: "visitorLogs", has: "many", label: "discountRequests" },
    },
    discountRequestsAccountant: {
      forward: { on: "discountRequests", has: "one", label: "accountant" },
      reverse: { on: "profiles", has: "many", label: "discountRequestsInitiated" },
    },
    performanceSalesperson: {
      forward: { on: "salespersonPerformance", has: "one", label: "salesperson", onDelete: "cascade" },
      reverse: { on: "profiles", has: "many", label: "performanceEntries" },
    },
    performanceGivenBy: {
      forward: { on: "salespersonPerformance", has: "one", label: "givenBy" },
      reverse: { on: "profiles", has: "many", label: "performanceGiven" },
    },
    devicesProfile: {
      forward: { on: "devices", has: "one", label: "profile" },
      reverse: { on: "profiles", has: "many", label: "devices" },
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
