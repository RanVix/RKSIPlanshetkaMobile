import { COLORS } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar hidden={true} />

      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen
          name="search"
          options={{
            presentation: "transparentModal",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
      </Stack>
    </View>
  );
}
