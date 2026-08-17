import type { ComponentType } from "react";
import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

// expo-linear-gradient doesn't ship NativeWind support out of the box —
// this teaches it to translate `className` into `style`, once, so every
// gradient banner across the app can just use Tailwind classes.
export const GradientView = cssInterop(LinearGradient, { className: "style" }) as ComponentType<
  LinearGradientProps & { className?: string }
>;
