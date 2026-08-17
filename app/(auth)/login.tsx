import { useEffect, useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Phone, Lock, Eye, EyeOff } from "lucide-react-native";
import { GradientView } from "@/components/ui/GradientView";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { loginWithMobile, AuthBridgeError } from "@/lib/auth-bridge";
import { useTenantConfig } from "@/contexts/TenantConfigContext";

export default function LoginScreen() {
  const { brand, branding } = useTenantConfig();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const cardProgress = useSharedValue(0);
  useEffect(() => {
    cardProgress.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
  }, [cardProgress]);
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [{ translateY: (1 - cardProgress.value) * 24 }],
  }));

  async function handleLogin() {
    setError(undefined);
    if (mobile.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      await loginWithMobile(mobile, password);
      // SessionProvider picks up the new auth state; app/index.tsx redirects
      // to the right role home automatically.
    } catch (err) {
      setError(err instanceof AuthBridgeError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-brand-gold-50">
      <ScrollView contentContainerClassName="flex-1" keyboardShouldPersistTaps="handled">
        <GradientView
          colors={brand.gradientPrimary}
          className="items-center overflow-hidden rounded-b-[40px] px-6 pb-16 pt-20"
        >
          <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <View className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-white/10" />

          <Image
            source={branding.logoLightUrl ? { uri: branding.logoLightUrl } : require("@/assets/images/logo.png")}
            style={{ width: 96, height: 96 }}
            contentFit="contain"
          />
          <AppText className="mt-2 font-sans-bold text-2xl text-white">{branding.appName}</AppText>
          {branding.shortName && <AppText className="mt-1 font-sans text-white/80">{branding.shortName}</AppText>}
        </GradientView>

        <View className="flex-1 px-6">
          <Animated.View style={cardAnimatedStyle}>
            <View className="-mt-8 gap-6 rounded-3xl bg-white p-6 shadow-lg">
              <View>
                <AppText className="font-sans-semibold text-xl text-[#1c1c1e]">Sign in</AppText>
                <AppText className="mt-1 font-sans text-[#6b7280]">Use your mobile number and password.</AppText>
              </View>

              <View className="gap-4">
                <TextField
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Mobile number"
                  autoComplete="tel"
                  icon={<Phone size={18} color="#9ca3af" />}
                />
                <TextField
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  autoComplete="password"
                  icon={<Lock size={18} color="#9ca3af" />}
                  rightAccessory={
                    <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                      {showPassword ? (
                        <EyeOff size={18} color="#9ca3af" />
                      ) : (
                        <Eye size={18} color="#9ca3af" />
                      )}
                    </Pressable>
                  }
                />
              </View>

              {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}

              <Button onPress={handleLogin} loading={loading}>
                Sign in
              </Button>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
