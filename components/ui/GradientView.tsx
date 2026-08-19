import type { ComponentType } from "react";
import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

// expo-linear-gradient has no NativeWind support, so teach it to translate `className` into `style` here, once.
export const GradientView = cssInterop(LinearGradient, { className: "style" }) as ComponentType<
  LinearGradientProps & { className?: string }
>;
