import { COLORS } from "@/constants/theme";
import { BottomNav, TabId } from "@/features/schedule/components/BottomNav";
import { NavigationBar } from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("light");
    }
  }, []);

  const getActiveTab = (): TabId => {
    if (pathname === "/bells") return "bells";
    return "pairs";
  };

  const isSearchScreen = pathname === "/search";

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" hidden={true} />
        <NavigationBar style="light" />

        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              animation: "slide_from_left",
            }}
          />

          <Stack.Screen
            name="bells"
            options={{
              animation: "slide_from_right",
            }}
          />

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

        {!isSearchScreen && <BottomNav activeTab={getActiveTab()} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
