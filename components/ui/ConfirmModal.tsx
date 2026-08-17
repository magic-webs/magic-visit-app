import { Modal, Pressable, View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onCancel}>
        <Pressable className="w-full gap-5 rounded-3xl bg-white p-6 shadow-lg" onPress={(e) => e.stopPropagation()}>
          <View className="gap-1.5">
            <AppText className="font-sans-semibold text-lg text-[#1c1c1e]">{title}</AppText>
            {message && <AppText className="font-sans text-sm text-[#6b7280]">{message}</AppText>}
          </View>
          <View className="flex-row gap-3">
            <Button variant="outline" className="flex-1" onPress={onCancel}>
              {cancelText}
            </Button>
            <Button variant={destructive ? "destructive" : "primary"} className="flex-1" onPress={onConfirm}>
              {confirmText}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
