import { useCallback, type ComponentType } from "react";
import { ActivityIndicator, Pressable, View, type GestureResponderEvent, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { AppText } from "./AppText";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "destructiveOutline" | "ghost";

interface ButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  variant?: ButtonVariant;
  loading?: boolean;
  className?: string;
  /** Leading icon rendered before the label, e.g. a person-plus glyph. */
  icon?: ComponentType<{ size?: number; color?: string }>;
}

// The "lip" is a solid-color layer sat behind the button face at rest, and
// covered up on press — that's the whole Duolingo 3D trick, no shadows
// involved. `edge` is that lip's color; `depth` is how tall it is.
const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string; spinner: string; edge: string }> = {
  primary: { container: "bg-brand-teal", text: "text-white", spinner: "#fff", edge: "#065c50" },
  secondary: { container: "bg-brand-gold-200", text: "text-brand-teal", spinner: "#097969", edge: "#e8d98a" },
  outline: { container: "border border-brand-teal bg-white", text: "text-brand-teal", spinner: "#097969", edge: "#bfe6db" },
  destructive: { container: "bg-status-notInterested", text: "text-white", spinner: "#fff", edge: "#b91c1c" },
  destructiveOutline: {
    container: "border border-status-notInterested bg-white",
    text: "text-status-notInterested",
    spinner: "#ef4444",
    edge: "#fecaca",
  },
  ghost: { container: "bg-transparent", text: "text-brand-teal", spinner: "#097969", edge: "transparent" },
};

const DEPTH = 4;

export function Button({
  children,
  variant = "primary",
  loading,
  disabled,
  className,
  icon: Icon,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;
  const pressDepth = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressDepth.value }],
  }));

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      pressDepth.value = withTiming(DEPTH, { duration: 80 });
      onPressIn?.(e);
    },
    [onPressIn, pressDepth],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      pressDepth.value = withTiming(0, { duration: 80 });
      onPressOut?.(e);
    },
    [onPressOut, pressDepth],
  );

  // Ghost is a plain text-style button — no card, so no 3D lip to draw.
  if (variant === "ghost") {
    return (
      <View className={className}>
        <Pressable
          disabled={isDisabled}
          className={cn(
            "flex-row items-center justify-center rounded-full px-5 py-3.5",
            styles.container,
            isDisabled && "opacity-50",
          )}
          {...props}
        >
          {loading && <ActivityIndicator className="mr-2" color={styles.spinner} />}
          {!loading && Icon && <Icon size={18} color={styles.spinner} />}
          <AppText className={cn("font-sans-semibold text-base", Icon && !loading && "ml-2", styles.text)}>
            {children}
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View className={className} style={{ opacity: isDisabled ? 0.5 : 1 }}>
      <View className="rounded-full" style={{ backgroundColor: styles.edge }}>
        <Animated.View style={[{ marginBottom: DEPTH }, animatedStyle]}>
          <Pressable
            disabled={isDisabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className={cn("flex-row items-center justify-center rounded-full px-5 py-3.5", styles.container)}
            {...props}
          >
            {loading && <ActivityIndicator className="mr-2" color={styles.spinner} />}
            {!loading && Icon && <Icon size={18} color={styles.spinner} />}
            <AppText className={cn("font-sans-semibold text-base", Icon && !loading && "ml-2", styles.text)}>
              {children}
            </AppText>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
