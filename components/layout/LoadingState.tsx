import { ScreenSkeleton } from "@/components/layout/Skeletons";

// Generic placeholder while a role gate is still resolving, before any layout is picked; data screens use the specific skeletons in Skeletons.tsx instead.
export function LoadingState() {
  return <ScreenSkeleton />;
}
