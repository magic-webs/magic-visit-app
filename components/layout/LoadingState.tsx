import { ScreenSkeleton } from "@/components/layout/Skeletons";

// Shown only while a role gate is still checking auth, before any layout
// (and therefore any real content shape) has been picked — see
// app/(app)/*/_layout.tsx. Data-bearing screens use the more specific
// skeletons in Skeletons.tsx instead, shaped to match what loads in.
export function LoadingState() {
  return <ScreenSkeleton />;
}
