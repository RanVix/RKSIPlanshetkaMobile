import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { BottomNav, TabId } from "@/features/schedule/components/BottomNav";
import { NavigationBar } from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const fixFontScale = () => {
  if ((Text as any).defaultProps == null) {
    (Text as any).defaultProps = {};
  }
  (Text as any).defaultProps.maxFontSizeMultiplier = 1;
  (Text as any).defaultProps.allowFontScaling = false;

  if ((TextInput as any).defaultProps == null) {
    (TextInput as any).defaultProps = {};
  }
  (TextInput as any).defaultProps.maxFontSizeMultiplier = 1;
  (TextInput as any).defaultProps.allowFontScaling = false;
};

fixFontScale();

function MainLayout() {
  const pathname = usePathname();
  const { theme, colors } = useTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle(theme === "dark" ? "light" : "dark");
    }
  }, [theme]);

  const getActiveTab = (): TabId => {
    if (pathname === "/bells") return "bells";
    return "pairs";
  };

  const isSearchScreen = pathname === "/search";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} hidden={true} />

      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: "slide_from_left",
            animationDuration: 180,
          }}
        />

        <Stack.Screen
          name="bells"
          options={{
            animation: "slide_from_right",
            animationDuration: 180,
          }}
        />

        <Stack.Screen
          name="search"
          options={{
            presentation: "transparentModal",
            animation: "slide_from_bottom",
            animationDuration: 200,
            contentStyle: { backgroundColor: "transparent" },
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
      </Stack>

      {!isSearchScreen && <BottomNav activeTab={getActiveTab()} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
