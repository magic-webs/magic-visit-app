// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  branches: {
    bind: {
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwnBranch: "auth.ref('$user.profile.branch.id')[0] == data.id",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && (isOwner || isOwnBranch)) || isSuperAdminOperator || isScopedOperator",
      create: "sameTenant && isOwner",
      delete: "sameTenant && isOwner",
      update: "sameTenant && isOwner",
    },
  },
  attrs: {
    allow: {
      create: "false",
    },
  },
  customers: {
    bind: {
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isAnyStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isReceptionist:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist'",
      isBranchManager:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager'",
      isOwnBranchManager:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
    },
    allow: {
      view: "sameTenant && isAnyStaff",
      create: "sameTenant && (isOwner || isBranchManager || isReceptionist)",
      delete: "sameTenant && isOwner",
      update: "sameTenant && (isOwner || isOwnBranchManager)",
    },
  },
  devices: {
    bind: {
      isSelf: "auth.id in data.ref('profile.$user.id')",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
    },
    allow: {
      view: "sameTenant && isSelf",
      create: "false",
      delete: "false",
      update: "false",
    },
  },
  salesRemarks: {
    bind: {
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isSelfAuthored: "auth.id in data.ref('author.$user.id')",
      isSalespersonView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'salesperson' && auth.id in data.ref('visitorLog.salesperson.$user.id')",
      isReceptionistView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.id in data.ref('visitorLog.receptionist.$user.id')",
      isBranchManagerView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('visitorLog.branch.id')",
    },
    allow: {
      view: "sameTenant && (isOwner || isBranchManagerView || isReceptionistView || isSalespersonView)",
      create:
        "sameTenant && (isOwner || isBranchManagerView || isReceptionistView || isSalespersonView) && isSelfAuthored",
      delete: "sameTenant && isOwner",
      update: "false",
    },
  },
  $users: {
    allow: {
      view: "auth.id == data.id",
      create: "false",
      update: "false",
    },
  },
  visitorLogs: {
    bind: {
      isOwnReceptionistLog:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.id in data.ref('receptionist.$user.id')",
      isOwnSalespersonLog:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'salesperson' && auth.id in data.ref('salesperson.$user.id')",
      isAccountantSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'accountant' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isBranchManagerSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
      isReceptionistCreate:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.ref('$user.profile.branch.id')[0] in data.ref('branch.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && (isOwner || isBranchManagerSameBranch || isOwnReceptionistLog || isOwnSalespersonLog || isAccountantSameBranch)) || isSuperAdminOperator || isScopedOperator",
      create:
        "sameTenant && (isOwner || isBranchManagerSameBranch || isReceptionistCreate)",
      delete: "sameTenant && isOwner",
      update:
        "sameTenant && (isOwner || isBranchManagerSameBranch || isOwnReceptionistLog || isOwnSalespersonLog)",
    },
  },
  profiles: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      delete: "false",
      update: "false",
    },
    fields: {
      passwordHash: "false",
    },
  },
  performanceRanges: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isManagement:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner' || auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager'",
    },
    allow: {
      view: "sameTenant && isStaff",
      create: "sameTenant && isManagement",
      delete: "sameTenant && isManagement",
      update: "sameTenant && isManagement",
    },
  },
  branding: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      delete: "false",
      update: "false",
    },
  },
  $default: {
    allow: {
      $default: "false",
    },
  },
  organizations: {
    bind: {
      isOwnOrgStaff: "data.id == auth.ref('$user.profile.tenantId')[0]",
      isScopedOperator:
        "data.id in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "isOwnOrgStaff || isSuperAdminOperator || isScopedOperator",
      create: "false",
      delete: "false",
      update: "false",
    },
  },
  panelOperators: {
    bind: {
      isSelf: "auth.id in data.ref('$user.id')",
    },
    allow: {
      view: "isSelf",
      create: "false",
      delete: "false",
      update: "false",
    },
    fields: {
      passwordHash: "false",
    },
  },
  discountRequests: {
    bind: {
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isAccountantView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'accountant' && auth.ref('$user.profile.branch.id')[0] in data.ref('visitorLog.branch.id')",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isBranchManagerView:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('visitorLog.branch.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && (isOwner || isBranchManagerView || isAccountantView)) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      delete: "false",
      update: "false",
    },
    fields: {
      otp: "false",
    },
  },
  salespersonPerformance: {
    bind: {
      isSelf: "auth.id in data.ref('salesperson.$user.id')",
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isSelfGiver: "auth.id in data.ref('givenBy.$user.id')",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
      isReceptionistSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.ref('$user.profile.branch.id')[0] in data.ref('salesperson.branch.id')",
      isBranchManagerSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('salesperson.branch.id')",
    },
    allow: {
      view: "(sameTenant && (isOwner || isBranchManagerSameBranch || isReceptionistSameBranch || isSelf)) || isSuperAdminOperator || isScopedOperator",
      create:
        "sameTenant && (isOwner || isBranchManagerSameBranch) && isSelfGiver",
      delete: "sameTenant && isOwner",
      update:
        "sameTenant && (isOwner || isBranchManagerSameBranch) && isSelfGiver",
    },
  },
  $files: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      isPanelOperator: "auth.ref('$user.panelOperator.id') != []",
    },
    allow: {
      view: "isPanelOperator || isStaff",
      create: "isPanelOperator || isStaff",
      delete: "false",
      update: "isPanelOperator || isStaff",
    },
  },
  themes: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      delete: "false",
      update: "false",
    },
  },
  salespersonAvailability: {
    bind: {
      isSelf: "auth.id in data.ref('profile.$user.id')",
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isAssignedReceptionist:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'receptionist' && auth.ref('$user.profile.id')[0] in data.ref('profile.assignedReceptionists.id')",
      isBranchManagerSameBranch:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'branch_manager' && auth.ref('$user.profile.branch.id')[0] in data.ref('profile.branch.id')",
    },
    allow: {
      view: "sameTenant && (isSelf || isOwner || isBranchManagerSameBranch || isAssignedReceptionist)",
      create: "false",
      delete: "sameTenant && isOwner",
      update: "sameTenant && (isSelf || isOwner || isBranchManagerSameBranch)",
    },
  },
  roles: {
    bind: {
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
      isScopedOperator:
        "data.tenantId in auth.ref('$user.panelOperator.organizations.id')",
      isSuperAdminOperator:
        "auth.ref('$user.panelOperator.role')[0] == 'super_admin'",
    },
    allow: {
      view: "(sameTenant && isStaff) || isSuperAdminOperator || isScopedOperator",
      create: "false",
      delete: "false",
      update: "false",
    },
  },
  offers: {
    bind: {
      isOwner:
        "auth.ref('$user.profile.assignedRole.inheritsScopeFrom')[0] == 'owner'",
      isStaff: "auth.ref('$user.profile.id') != []",
      sameTenant: "data.tenantId == auth.ref('$user.profile.tenantId')[0]",
    },
    allow: {
      view: "sameTenant && isStaff",
      create: "sameTenant && isOwner",
      delete: "sameTenant && isOwner",
      update: "sameTenant && isOwner",
    },
  },
} satisfies InstantRules;

export default rules;
