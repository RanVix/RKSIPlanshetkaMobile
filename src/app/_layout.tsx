import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ScheduleProvider } from "@/context/ScheduleContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { BottomNav, TabId } from "@/features/schedule/components/BottomNav";
import { prefetchSearchData } from "@/hooks/useSearchData";
import { UpdateModal } from "../features/components/UpdateModal";

const fixFontScale = () => {
  const FORCED_TEXT_PROPS = {
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  } as const;

  const patchFactory = (mod: any, key: "jsx" | "jsxs" | "jsxDEV") => {
    if (!mod) return;
    const original = mod[key];
    if (!original || original.__fontScalePatched) return;

    const patched = (type: any, props: any, ...rest: any[]) => {
      if (type === Text || type === TextInput) {
        props = { ...props, ...FORCED_TEXT_PROPS };
      }
      return original(type, props, ...rest);
    };
    patched.__fontScalePatched = true;

    try {
      mod[key] = patched;
    } catch {}
  };

  try {
    patchFactory(require("react/jsx-runtime"), "jsx");
    patchFactory(require("react/jsx-runtime"), "jsxs");
  } catch {}

  try {
    patchFactory(require("react/jsx-dev-runtime"), "jsxDEV");
  } catch {}

  const originalCreateElement = React.createElement;
  if (!(originalCreateElement as any).__fontScalePatched) {
    const patchedCreateElement = ((
      type: any,
      props: any,
      ...children: any[]
    ) => {
      if (type === Text || type === TextInput) {
        props = { ...props, ...FORCED_TEXT_PROPS };
      }
      return (originalCreateElement as any)(type, props, ...children);
    }) as typeof React.createElement;
    (patchedCreateElement as any).__fontScalePatched = true;
    (React as any).createElement = patchedCreateElement;
  }
};

fixFontScale();

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "OFFLINE_SCHEDULE_CACHE",
});

function MainLayout() {
  const pathname = usePathname();
  const { theme, colors } = useTheme();

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

      <UpdateModal />
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
