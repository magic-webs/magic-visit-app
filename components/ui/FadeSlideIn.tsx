import { useEffect } from "react";
import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";

// Reusable fade + slide-up entrance, used across dashboards/profile for a
// consistent feel with the login screen's card animation. Style-only
// Animated.View (no className) — see Button.tsx for why.
export function FadeSlideIn({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [progress, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 16 }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
