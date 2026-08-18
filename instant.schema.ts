// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    branches: i.entity({
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      location: i.string(),
      name: i.string(),
      phone: i.string().optional(),
      tenantId: i.string().indexed(),
    }),
    branding: i.entity({
      appName: i.string(),
      iconFileId: i.string().optional(),
      logoDarkFileId: i.string().optional(),
      logoLightFileId: i.string().optional(),
      shortName: i.string().optional(),
      tenantId: i.string().unique().indexed(),
      updatedAt: i.date(),
    }),
    customers: i.entity({
      address: i.string().optional(),
      doa: i.string().optional(),
      dob: i.string().optional(),
      email: i.string().indexed().optional(),
      gender: i.string().optional(),
      hAndM: i.string().optional(),
      isPrimeMember: i.boolean().indexed().optional(),
      mobile: i.string().indexed(),
      name: i.string(),
      primeDiscountType: i.string().optional(),
      primeDiscountValue: i.number().optional(),
      tenantId: i.string().indexed(),
      type: i.string().indexed(),
    }),
    devices: i.entity({
      createdAt: i.date().indexed(),
      deviceId: i.string().unique().indexed(),
      deviceName: i.string().optional(),
      expoPushToken: i.string().indexed(),
      lastActiveAt: i.date().indexed(),
      osVersion: i.string().optional(),
      platform: i.string().optional(),
      tenantId: i.string().indexed(),
    }),
    discountRequests: i.entity({
      appliedAt: i.date().indexed().optional(),
      createdAt: i.date().indexed(),
      discountType: i.string(),
      discountValue: i.number(),
      otp: i.string().optional(),
      otpAttempts: i.number().optional(),
      status: i.string().indexed(),
      tenantId: i.string().indexed(),
    }),
    offers: i.entity({
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      expiresAt: i.date().indexed().optional(),
      tenantId: i.string().indexed(),
      title: i.string(),
      trigger: i.string().indexed(),
      type: i.string(),
      value: i.number(),
    }),
    organizations: i.entity({
      authEmailDomain: i.string().indexed(),
      createdAt: i.date().indexed(),
      name: i.string(),
      plan: i.string().indexed().optional(),
      primaryContactEmail: i.string().optional(),
      slug: i.string().unique().indexed(),
      status: i.string().indexed(),
      updatedAt: i.date(),
    }),
    panelOperators: i.entity({
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      email: i.string().unique().indexed(),
      name: i.string(),
      passwordHash: i.string(),
      role: i.string().indexed(),
    }),
    performanceRanges: i.entity({
      color: i.string(),
      createdAt: i.date().indexed(),
      label: i.string(),
      maxPoints: i.number(),
      minPoints: i.number().indexed(),
      tenantId: i.string().indexed(),
    }),
    profiles: i.entity({
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      doa: i.string().optional(),
      dob: i.string().optional(),
      email: i.string().optional(),
      employeeId: i.string().indexed().optional(),
      gender: i.string().optional(),
      hAndM: i.string().optional(),
      mobile: i.string().indexed(),
      name: i.string(),
      passwordHash: i.string(),
      role: i.string().indexed(),
      roleId: i.string().indexed(),
      tenantId: i.string().indexed(),
      updatedAt: i.date(),
    }),
    roles: i.entity({
      active: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      inheritsScopeFrom: i.string().indexed(),
      isSystem: i.boolean().indexed(),
      key: i.string().indexed(),
      name: i.string(),
      permissions: i.any(),
      tenantId: i.string().indexed(),
      updatedAt: i.date(),
    }),
    salespersonAvailability: i.entity({
      availabilityStatus: i.string().indexed(),
      statusChangedAt: i.date().indexed(),
      tenantId: i.string().indexed(),
    }),
    salespersonPerformance: i.entity({
      createdAt: i.date().indexed(),
      month: i.string().indexed(),
      points: i.number(),
      tenantId: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    salesRemarks: i.entity({
      budget: i.string().optional(),
      createdAt: i.date().indexed(),
      followUpDate: i.string().indexed().optional(),
      remark: i.string(),
      tenantId: i.string().indexed(),
    }),
    themes: i.entity({
      dark: i.any(),
      font: i.string(),
      isPreset: i.boolean(),
      light: i.any(),
      presetKey: i.string().optional(),
      radius: i.number(),
      tenantId: i.string().unique().indexed(),
      updatedAt: i.date(),
    }),
    visitorLogs: i.entity({
      assignmentStatus: i.string().indexed(),
      followUpDate: i.string().indexed().optional(),
      purpose: i.string().optional(),
      serialNumber: i.number().indexed(),
      status: i.string().indexed(),
      tenantId: i.string().indexed(),
      visitedAt: i.date().indexed(),
    }),
  },
  links: {
    $streams$files: {
      forward: {
        on: "$streams",
        has: "many",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "$stream",
        onDelete: "cascade",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    branchesManager: {
      forward: {
        on: "branches",
        has: "one",
        label: "manager",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "managedBranches",
      },
    },
    customersBranch: {
      forward: {
        on: "customers",
        has: "one",
        label: "branch",
      },
      reverse: {
        on: "branches",
        has: "many",
        label: "customers",
      },
    },
    customersSalesperson: {
      forward: {
        on: "customers",
        has: "one",
        label: "salesperson",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "registeredCustomers",
      },
    },
    devicesProfile: {
      forward: {
        on: "devices",
        has: "one",
        label: "profile",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "devices",
      },
    },
    discountRequestsAccountant: {
      forward: {
        on: "discountRequests",
        has: "one",
        label: "accountant",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "discountRequestsInitiated",
      },
    },
    discountRequestsVisitorLog: {
      forward: {
        on: "discountRequests",
        has: "one",
        label: "visitorLog",
        onDelete: "cascade",
      },
      reverse: {
        on: "visitorLogs",
        has: "many",
        label: "discountRequests",
      },
    },
    panelOperators$user: {
      forward: {
        on: "panelOperators",
        has: "one",
        label: "$user",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "panelOperator",
      },
    },
    panelOperatorsOrganizations: {
      forward: {
        on: "panelOperators",
        has: "many",
        label: "organizations",
      },
      reverse: {
        on: "organizations",
        has: "many",
        label: "panelOperators",
      },
    },
    profiles$user: {
      forward: {
        on: "profiles",
        has: "one",
        label: "$user",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "profile",
      },
    },
    profilesAssignedRole: {
      forward: {
        on: "profiles",
        has: "one",
        label: "assignedRole",
      },
      reverse: {
        on: "roles",
        has: "many",
        label: "profiles",
      },
    },
    profilesAssignedSalespersons: {
      forward: {
        on: "profiles",
        has: "many",
        label: "assignedSalespersons",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "assignedReceptionists",
      },
    },
    profilesBranch: {
      forward: {
        on: "profiles",
        has: "one",
        label: "branch",
      },
      reverse: {
        on: "branches",
        has: "many",
        label: "staff",
      },
    },
    profilesManager: {
      forward: {
        on: "profiles",
        has: "one",
        label: "manager",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "directReports",
      },
    },
    salespersonAvailabilityProfile: {
      forward: {
        on: "salespersonAvailability",
        has: "one",
        label: "profile",
      },
      reverse: {
        on: "profiles",
        has: "one",
        label: "availability",
      },
    },
    salespersonPerformanceGivenBy: {
      forward: {
        on: "salespersonPerformance",
        has: "one",
        label: "givenBy",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "performanceGiven",
      },
    },
    salespersonPerformanceSalesperson: {
      forward: {
        on: "salespersonPerformance",
        has: "one",
        label: "salesperson",
        onDelete: "cascade",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "performanceEntries",
      },
    },
    salesRemarksAuthor: {
      forward: {
        on: "salesRemarks",
        has: "one",
        label: "author",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "authoredRemarks",
      },
    },
    salesRemarksVisitorLog: {
      forward: {
        on: "salesRemarks",
        has: "one",
        label: "visitorLog",
        onDelete: "cascade",
      },
      reverse: {
        on: "visitorLogs",
        has: "many",
        label: "remarks",
      },
    },
    visitorLogsBranch: {
      forward: {
        on: "visitorLogs",
        has: "one",
        label: "branch",
      },
      reverse: {
        on: "branches",
        has: "many",
        label: "visitorLogs",
      },
    },
    visitorLogsCustomer: {
      forward: {
        on: "visitorLogs",
        has: "one",
        label: "customer",
        onDelete: "cascade",
      },
      reverse: {
        on: "customers",
        has: "many",
        label: "visitorLogs",
      },
    },
    visitorLogsReceptionist: {
      forward: {
        on: "visitorLogs",
        has: "one",
        label: "receptionist",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "receptionistLogs",
      },
    },
    visitorLogsSalesperson: {
      forward: {
        on: "visitorLogs",
        has: "one",
        label: "salesperson",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "salespersonLogs",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
