// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  // Fallback for any namespace not explicitly covered below.
  $default: {
    allow: { $default: "false" },
  },
  // Blocks clients from creating ad-hoc attributes outside the defined schema.
  attrs: {
    allow: { create: "false" },
  },

  $users: {
    allow: {
      // Explicit, not left to fall back to Instant's built-in $users
      // defaults — the top-level $default deny-all above takes precedence
      // over those built-ins for any operation not spelled out here.
      view: "auth.id == data.id",
      create: "false",
      update: "false",
    },
  },

  // A tenant business. Every rule below repeats the same two-bind shape —
  // isSuperAdminOperator (sees every tenant) / isScopedOperator (sees only
  // the tenants linked via panelOperatorOrganizations) — because a
  // panelOperator carries no `profiles` link, so `sameTenant`-style checks
  // never apply to them; this is what "structurally denied unless
  // explicitly granted" looks like for that principal type.
  organizations: {
    bind: {
      isOwnOrgStaff: "data.id == auth.ref('$user.profile.tenantId')[0]",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.id in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view: "isOwnOrgStaff || isSuperAdminOperator || isScopedOperator",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // Vendor/agency console identity. All mutation happens via the
  // auth-bridge Worker's admin-SDK-backed /panel/login and
  // /platform/organizations routes.
  panelOperators: {
    bind: {
      isSelf: "auth.id in data.ref('$user.id')",
    },
    allow: {
      view: "isSelf",
      create: "false",
      update: "false",
      delete: "false",
    },
    fields: {
      passwordHash: "false",
    },
  },

  // Tenant-owned, data-driven roles. Mutated only by the auth-bridge Worker
  // (POST/PATCH/DELETE /tenants/:id/roles) so a custom role's capability
  // list can be validated server-side (e.g. an operator can't grant more
  // than they hold) — the client only ever reads these.
  roles: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isStaff: "auth.ref('$user.profile.id') != []",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  themes: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isStaff: "auth.ref('$user.profile.id') != []",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  branding: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isStaff: "auth.ref('$user.profile.id') != []",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // Staff identity. Mutated only by the auth-bridge Worker via the admin SDK,
  // which bypasses these rules entirely — the client never writes here directly.
  profiles: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      update: "false",
      delete: "false",
    },
    fields: {
      passwordHash: "false",
    },
  },

  // Split out from `profiles` so the salesperson can safely self-update it —
  // nothing sensitive lives here.
  salespersonAvailability: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isSelf: "auth.id in data.ref('profile.$user.id')",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isBranchManagerSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('profile.branch.id')",
      isAssignedReceptionist:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.ref('$user.profile.id')[0] in data.ref('profile.assignedReceptionists.id')",
    },
    allow: {
      view: "sameTenant && (isSelf || isOwner || isBranchManagerSameBranch || isAssignedReceptionist)",
      create: "false",
      update: "sameTenant && (isSelf || isOwner || isBranchManagerSameBranch)",
      delete: "sameTenant && isOwner",
    },
  },

  branches: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isOwnBranch: "auth.ref('$user.profile.branch.id')[0] == data.id",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view: "(sameTenant && (isOwner || isOwnBranch)) || isSuperAdminOperator || isScopedOperator",
      create: "sameTenant && isOwner",
      update: "sameTenant && isOwner",
      delete: "sameTenant && isOwner",
    },
  },

  customers: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isAnyStaff: "auth.ref('$user.profile.id') != []",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isBranchManager: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager'",
      isReceptionist: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist'",
      isOwnBranchManager:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
    },
    allow: {
      // Deliberately not branch-scoped: chain-wide customer/mobile-number
      // recognition at the front desk is load-bearing business behavior —
      // but it never crosses a tenant boundary.
      view: "sameTenant && isAnyStaff",
      create: "sameTenant && (isOwner || isBranchManager || isReceptionist)",
      update: "sameTenant && (isOwner || isOwnBranchManager)",
      delete: "sameTenant && isOwner",
    },
  },

  visitorLogs: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isBranchManagerSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
      isOwnReceptionistLog:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.id in data.ref('receptionist.$user.id')",
      isOwnSalespersonLog:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'salesperson' && auth.id in data.ref('salesperson.$user.id')",
      isAccountantSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'accountant' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
      isReceptionistCreate:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view:
        "(sameTenant && (isOwner || isBranchManagerSameBranch || isOwnReceptionistLog || isOwnSalespersonLog || isAccountantSameBranch)) || isSuperAdminOperator || isScopedOperator",
      create: "sameTenant && (isOwner || isBranchManagerSameBranch || isReceptionistCreate)",
      update: "sameTenant && (isOwner || isBranchManagerSameBranch || isOwnReceptionistLog || isOwnSalespersonLog)",
      delete: "sameTenant && isOwner",
    },
  },

  salesRemarks: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isBranchManagerView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('visitorLog.branch.id')",
      isReceptionistView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.id in data.ref('visitorLog.receptionist.$user.id')",
      isSalespersonView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'salesperson' && auth.id in data.ref('visitorLog.salesperson.$user.id')",
      isSelfAuthored: "auth.id in data.ref('author.$user.id')",
    },
    allow: {
      view: "sameTenant && (isOwner || isBranchManagerView || isReceptionistView || isSalespersonView)",
      create:
        "sameTenant && (isOwner || isBranchManagerView || isReceptionistView || isSalespersonView) && isSelfAuthored",
      // Append-only notes thread — no edit path.
      update: "false",
      delete: "sameTenant && isOwner",
    },
  },

  // Accountant-initiated, branch-manager-OTP-authorized discount workflow.
  // All writes (create/reveal-otp/verify-otp/cancel) go through the
  // auth-bridge Worker via the admin SDK, same as `profiles`/`devices` —
  // the OTP must be server-generated or the accountant's own device would
  // already know the code it's supposedly waiting on the manager to relay.
  discountRequests: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isBranchManagerView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('visitorLog.branch.id')",
      isAccountantView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'accountant' && auth.ref('$user.profile.branch.id')[0] in data.ref('visitorLog.branch.id')",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      // Salesperson/receptionist excluded on purpose — financial approval
      // stays need-to-know.
      view: "(sameTenant && (isOwner || isBranchManagerView || isAccountantView)) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      update: "false",
      delete: "false",
    },
    fields: {
      otp: "false",
    },
  },

  offers: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isStaff: "auth.ref('$user.profile.id') != []",
    },
    allow: {
      view: "sameTenant && isStaff",
      create: "sameTenant && isOwner",
      update: "sameTenant && isOwner",
      delete: "sameTenant && isOwner",
    },
  },

  performanceRanges: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isManagement:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner' || auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager'",
      isStaff: "auth.ref('$user.profile.id') != []",
    },
    allow: {
      view: "sameTenant && isStaff",
      create: "sameTenant && isManagement",
      update: "sameTenant && isManagement",
      delete: "sameTenant && isManagement",
    },
  },

  // Written only by the auth-bridge Worker via the admin SDK (same as
  // `profiles`) — the client never registers its own push token directly.
  devices: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isSelf: "auth.id in data.ref('profile.$user.id')",
    },
    allow: {
      view: "sameTenant && isSelf",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  salespersonPerformance: {
    bind: {
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner: "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isBranchManagerSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('salesperson.branch.id')",
      isReceptionistSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.ref('$user.profile.branch.id')[0] in data.ref('salesperson.branch.id')",
      isSelf: "auth.id in data.ref('salesperson.$user.id')",
      isSelfGiver: "auth.id in data.ref('givenBy.$user.id')",
      isSuperAdminOperator: "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isScopedOperator: "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
    },
    allow: {
      view:
        "(sameTenant && (isOwner || isBranchManagerSameBranch || isReceptionistSameBranch || isSelf)) || isSuperAdminOperator || isScopedOperator",
      create: "sameTenant && (isOwner || isBranchManagerSameBranch) && isSelfGiver",
      update: "sameTenant && (isOwner || isBranchManagerSameBranch) && isSelfGiver",
      delete: "sameTenant && isOwner",
    },
  },
} satisfies InstantRules;

export default rules;
