import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex flex-1 items-center justify-center bg-brand-gold-50 p-5">
        <Text className="font-sans-semibold text-lg text-brand-teal">This screen does not exist.</Text>
        <Link href="/" className="mt-4 rounded-full bg-brand-teal px-6 py-3">
          <Text className="font-sans-medium text-white">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
