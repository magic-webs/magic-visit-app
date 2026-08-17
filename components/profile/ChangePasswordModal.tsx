import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Lock, Eye, EyeOff } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { changeOwnPassword, AuthBridgeError } from "@/lib/auth-bridge";

export function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function reset() {
    setPassword("");
    setConfirmPassword("");
    setError(undefined);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      await changeOwnPassword(password);
      handleClose();
    } catch (err) {
      setError(err instanceof AuthBridgeError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={handleClose}>
        <Pressable className="w-full gap-5 rounded-3xl bg-white p-6 shadow-lg" onPress={(e) => e.stopPropagation()}>
          <View className="gap-1.5">
            <AppText className="font-sans-semibold text-lg text-[#1c1c1e]">Change Password</AppText>
            <AppText className="font-sans text-sm text-[#6b7280]">Choose a new password for your account.</AppText>
          </View>

          <View className="gap-4">
            <TextField
              label="New Password"
              icon={<Lock size={18} color="#9ca3af" />}
              rightAccessory={
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                </Pressable>
              }
              helperText="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TextField
              label="Confirm Password"
              icon={<Lock size={18} color="#9ca3af" />}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
            {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}
          </View>

          <View className="flex-row gap-3">
            <Button variant="outline" className="flex-1" onPress={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onPress={handleSubmit} loading={submitting}>
              Save
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
