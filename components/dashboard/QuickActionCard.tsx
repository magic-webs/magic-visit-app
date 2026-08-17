import { useCallback } from "react";
import type { ComponentType } from "react";
import { Pressable, View, type GestureResponderEvent } from "react-native";
import { ArrowRight } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";

// Same press-scale pattern as Button.tsx — plain View/Pressable carry
// className, a style-only Animated.View carries the transform.
export function QuickActionCard({
  icon: Icon,
  label,
  description,
  tint = theme.teal.DEFAULT,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  description?: string;
  tint?: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(
    (_e: GestureResponderEvent) => {
      scale.value = withSpring(0.95, { damping: 16, stiffness: 400 });
    },
    [scale],
  );
  const handlePressOut = useCallback(
    (_e: GestureResponderEvent) => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    },
    [scale],
  );

  return (
    <View className="flex-1">
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="gap-3 rounded-2xl p-4"
          style={{ backgroundColor: `${tint}0D` }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${tint}1F` }}>
            <Icon size={20} color={tint} />
          </View>
          <View>
            <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">{label}</AppText>
            {description && <AppText className="mt-0.5 font-sans text-xs text-[#6b7280]">{description}</AppText>}
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: tint }}>
            <ArrowRight size={16} color="#fff" />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
