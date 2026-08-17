import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StaffList } from "@/components/staff/StaffList";
import { useSession } from "@/contexts/SessionContext";
import { theme } from "@/constants/theme";

export default function ManagerStaffScreen() {
  const router = useRouter();
  const session = useSession();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-brand-gold-50">
      <StaffList
        branchId={session.branchId}
        roles={["receptionist", "salesperson"]}
        editPathname="/(app)/manager/staff/[staffId]"
      />
      <Pressable
        onPress={() => router.push("/(app)/manager/staff/new")}
        className="absolute right-5 h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: theme.teal.DEFAULT, bottom: insets.bottom + 92, elevation: 8 }}
      >
        <Plus size={26} color="#fff" />
      </Pressable>
    </View>
  );
}
