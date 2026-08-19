import { useEffect, useState, type ComponentType } from "react";
import { View, Pressable, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
// Expo Router's <Tabs> passes its own BottomTabBarProps to `tabBar`, not @react-navigation/bottom-tabs's (subtly incompatible, e.g. ColorValue vs string).
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { AppText } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";

export interface TabBarItem {
  key: string; // matches the <Tabs.Screen name="...">
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
}

const BAR_PADDING = 8; // matches the container's px-2/py-2

// Sliding pill highlight is a plain timed slide (no spring), sized against the bar's own width; style-only Animated.View carries the transform (see Button.tsx).
export function LiquidTabBar({ state, navigation, items }: BottomTabBarProps & { items: TabBarItem[] }) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;
  const activeIndex = Math.max(0, items.findIndex((item) => item.key === activeRouteName));

  const [containerWidth, setContainerWidth] = useState(0);
  const itemWidth = containerWidth > 0 ? (containerWidth - BAR_PADDING * 2) / items.length : 0;

  const translateX = useSharedValue(0);
  useEffect(() => {
    if (itemWidth > 0) {
      translateX.value = withTiming(activeIndex * itemWidth, { duration: 260, easing: Easing.out(Easing.cubic) });
    }
  }, [activeIndex, itemWidth, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  function handleLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }

  return (
    <View
      onLayout={handleLayout}
      className="absolute inset-x-4 flex-row items-center rounded-full bg-white px-2 py-2 shadow-lg"
      style={{ bottom: insets.bottom + 12, elevation: 8 }}
    >
      {itemWidth > 0 && (
        <Animated.View
          style={[
            pillStyle,
            {
              position: "absolute",
              left: BAR_PADDING,
              top: 8,
              bottom: 8,
              width: itemWidth,
              borderRadius: 999,
              backgroundColor: `${theme.teal.DEFAULT}1A`,
            },
          ]}
        />
      )}
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;
        const color = isActive ? theme.teal.DEFAULT : "#9ca3af";
        return (
          <Pressable
            key={item.key}
            onPress={() => navigation.navigate(item.key)}
            className="flex-1 items-center justify-center gap-0.5 rounded-full py-2"
          >
            <Icon size={20} color={color} />
            <AppText className="font-sans-medium text-[11px]" style={{ color }}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
