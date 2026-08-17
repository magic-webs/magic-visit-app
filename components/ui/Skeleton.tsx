import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { cn } from "@/lib/cn";

// Pulsing placeholder block used everywhere data is still loading — swap in
// for any bit of UI (text line, avatar, icon chip, button) by sizing it with
// className, same as a plain View. The opacity pulse lives on a style-only
// Animated.View wrapper (see Button.tsx for why className can't go there
// directly with a manually-imported reanimated component).
export function Skeleton({ className, style }: { className?: string; style?: ViewStyle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + progress.value * 0.3,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View className={cn("rounded-lg bg-[#e5e7eb]", className)} style={style} />
    </Animated.View>
  );
}
