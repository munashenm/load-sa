import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#f59e0b",
          contentStyle: { backgroundColor: "#020617" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="jobs" options={{ title: "Jobs" }} />
        <Stack.Screen name="earnings" options={{ title: "Earnings" }} />
        <Stack.Screen name="job/[id]" options={{ title: "Active delivery" }} />
      </Stack>
    </>
  );
}
