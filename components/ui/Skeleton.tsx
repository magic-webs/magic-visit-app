import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { cn } from "@/lib/cn";

// Pulsing placeholder block; size it with className like a plain View. The opacity pulse lives on a style-only Animated.View wrapper.
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
