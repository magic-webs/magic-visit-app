import { useMemo } from "react";
import { db } from "@/lib/db";
import type { VisitorStatus } from "@/constants/theme";

export type DateFilter = "today" | "yesterday" | "3days" | "week" | "month" | "followups" | "all";

export interface VisitorLogsScope {
  type: "all" | "branch" | "own-receptionist" | "own-salesperson";
  branchId?: string;
  profileId?: string;
}

export interface VisitorLogsFilters {
  dateFilter: DateFilter;
  status?: VisitorStatus;
  gender?: string;
  hAndM?: string;
}

function getStartOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dateFilterRange(filter: DateFilter): { gte?: number; lt?: number } {
  const startOfToday = getStartOfToday();
  const oneDay = 24 * 60 * 60 * 1000;
  switch (filter) {
    case "today":
      return { gte: startOfToday, lt: startOfToday + oneDay };
    case "yesterday":
      return { gte: startOfToday - oneDay, lt: startOfToday };
    case "3days":
      return { gte: startOfToday - 3 * oneDay };
    case "week":
      return { gte: startOfToday - 7 * oneDay };
    case "month":
      return { gte: startOfToday - 30 * oneDay };
    default:
      return {};
  }
}

export interface DedupedVisitorEntry {
  latest: any;
  visitCount: number;
}

// Shared scope+filters -> InstaQL where-clause builder and dedupe-by-customer
// post-processing used by every role's visitor list screen.
export function useVisitorLogsQuery(scope: VisitorLogsScope, filters: VisitorLogsFilters) {
  const canQuery = scope.type === "all" || Boolean(scope.branchId || scope.profileId);

  const query = useMemo(() => {
    if (!canQuery) return null;

    const where: Record<string, any> = {};

    if (scope.type === "branch" && scope.branchId) where["branch.id"] = scope.branchId;
    if (scope.type === "own-receptionist" && scope.profileId) where["receptionist.id"] = scope.profileId;
    if (scope.type === "own-salesperson" && scope.profileId) where["salesperson.id"] = scope.profileId;

    if (filters.dateFilter === "followups") {
      where.followUpDate = { $isNull: false };
    } else {
      const range = dateFilterRange(filters.dateFilter);
      if (range.gte !== undefined || range.lt !== undefined) {
        const conditions: any[] = [];
        if (range.gte !== undefined) conditions.push({ visitedAt: { $gte: range.gte } });
        if (range.lt !== undefined) conditions.push({ visitedAt: { $lt: range.lt } });

        if (conditions.length === 1) {
          where.visitedAt = conditions[0].visitedAt;
        } else if (conditions.length > 1) {
          where.and = conditions;
        }
      }
    }

    if (filters.status) where.status = filters.status;
    if (filters.gender) where["customer.gender"] = filters.gender;
    if (filters.hAndM) where["customer.hAndM"] = filters.hAndM;

    return {
      visitorLogs: {
        $: { where, order: { visitedAt: "desc" } },
        customer: {},
        salesperson: {},
        receptionist: {},
      },
    };
  }, [
    canQuery,
    scope.type,
    scope.branchId,
    scope.profileId,
    filters.dateFilter,
    filters.status,
    filters.gender,
    filters.hAndM,
  ]);

  const { data, isLoading, error } = db.useQuery(query as any) as {
    data: any;
    isLoading: boolean;
    error: any;
  };

  const deduped = useMemo<DedupedVisitorEntry[]>(() => {
    if (!data?.visitorLogs) return [];
    const byCustomer = new Map<string, DedupedVisitorEntry>();
    for (const log of data.visitorLogs as any[]) {
      const customerId = log.customer?.id ?? log.id;
      const existing = byCustomer.get(customerId);
      if (!existing) {
        byCustomer.set(customerId, { latest: log, visitCount: 1 });
      } else {
        existing.visitCount += 1;
        if (log.visitedAt > existing.latest.visitedAt) existing.latest = log;
      }
    }
    return Array.from(byCustomer.values());
  }, [data]);

  return { logs: (data?.visitorLogs as any[]) ?? [], deduped, isLoading, error };
}
