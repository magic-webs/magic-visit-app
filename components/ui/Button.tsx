import { useCallback, type ComponentType } from "react";
import { ActivityIndicator, Pressable, View, type GestureResponderEvent, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { AppText } from "./AppText";
import { cn } from "@/lib/cn";
import { theme } from "@/constants/theme";

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
//
// A function, not a top-level object — `primary`/`secondary`/`ghost`'s
// spinner tint and `primary`/`secondary`'s edge reference `theme.teal.*`/
// `theme.gold.border`, which applyResolvedBrandColors() (see
// constants/theme.ts) mutates once a tenant's brand resolves. A frozen
// object built at import time would permanently keep the hardcoded default
// teal edge/spinner no matter what color a tenant picks — this is called
// fresh on every render instead. `outline`'s edge and the
// `destructive`/`destructiveOutline` variants stay fixed (a pale wash /
// status reds respectively) — there's no existing derived "pale tint" of
// the tenant's primary to substitute without risking a muddy result for an
// arbitrary hue.
function getVariantStyles(): Record<ButtonVariant, { container: string; text: string; spinner: string; edge: string }> {
  return {
    primary: { container: "bg-brand-teal", text: "text-white", spinner: "#fff", edge: theme.teal.edge },
    secondary: { container: "bg-brand-gold-200", text: "text-brand-teal", spinner: theme.teal.DEFAULT, edge: theme.gold.border },
    outline: { container: "border border-brand-teal bg-white", text: "text-brand-teal", spinner: theme.teal.DEFAULT, edge: "#bfe6db" },
    destructive: { container: "bg-status-notInterested", text: "text-white", spinner: "#fff", edge: "#b91c1c" },
    destructiveOutline: {
      container: "border border-status-notInterested bg-white",
      text: "text-status-notInterested",
      spinner: "#ef4444",
      edge: "#fecaca",
    },
    ghost: { container: "bg-transparent", text: "text-brand-teal", spinner: theme.teal.DEFAULT, edge: "transparent" },
  };
}

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
  const styles = getVariantStyles()[variant];
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
