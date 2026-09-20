import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { NavigationBar } from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ScheduleProvider } from "@/context/ScheduleContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { BottomNav, TabId } from "@/features/schedule/components/BottomNav";
import { prefetchSearchData } from "@/hooks/useSearchData";

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

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "OFFLINE_SCHEDULE_CACHE",
});

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 1000 * 60 * 60,
            gcTime: 1000 * 60 * 60 * 24 * 7,
            networkMode: "offlineFirst",
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  useEffect(() => {
    prefetchSearchData(queryClient);
  }, [queryClient]);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: Infinity,
          buster: "v1_schedule_cache",
        }}
      >
        <ThemeProvider>
          <ScheduleProvider>
            <MainLayout />
          </ScheduleProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
