import { COLORS } from "@/constants/theme";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("light");
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" hidden={true} />

        <NavigationBar style="light" />

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
    </SafeAreaProvider>
  );
}
