import type { StatTrend } from "@/components/dashboard/StatCard";

// Shared "today vs yesterday" percentage-change calculation for dashboard
// StatCards.
export function computeTrend(current: number, previous: number): StatTrend {
  if (previous === 0) {
    return current > 0 ? { direction: "up", percent: 100 } : { direction: "flat", percent: 0 };
  }
  const diff = current - previous;
  const percent = Math.round((Math.abs(diff) / previous) * 100);
  return { direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat", percent };
}

export function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfToday(): number {
  return startOfDay(new Date());
}

export function startOfYesterday(): number {
  return startOfToday() - 24 * 60 * 60 * 1000;
}
