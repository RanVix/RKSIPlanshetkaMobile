import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useScheduleContext } from "@/context/ScheduleContext";
import { useTheme } from "@/context/ThemeContext";
import { useSearchData } from "@/hooks/useSearchData";
import { SearchInput } from "../features/search/components/SearchInput";
import { SearchSection } from "../features/search/components/SearchSection";
import { SearchItem } from "../features/search/types/search";

const FAVORITES_STORAGE_KEY = "@schedule_favorites";

interface SectionData {
  id: string;
  title: string;
  subtitle?: string;
  iconName: keyof typeof Feather.glyphMap;
  items: SearchItem[];
}

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { setTargetName } = useScheduleContext();

  const {
    groups: apiGroups = [],
    teachers: apiTeachers = [],
    audiences: apiAudiences = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchData();

  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isFavoritesLoaded, setIsFavoritesLoaded] = useState(false);

  const translateY = useSharedValue(0);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          setFavoriteIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Ошибка при загрузке избранного:", e);
      } finally {
        setIsFavoritesLoaded(true);
      }
    };

    loadFavorites();
  }, []);

  const saveFavorites = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error("Ошибка при сохранении избранного:", e);
    }
  };

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const headerPanGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, translateY.value) }],
  }));

  const handleToggleFavorite = useCallback((item: SearchItem) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleItemPress = useCallback(
    (item: SearchItem) => {
      setTargetName(item.name);
      router.back();
    },
    [setTargetName, router],
  );

  const q = deferredQuery.trim().toLowerCase();

  const groups = useMemo(
    () =>
      q
        ? apiGroups.filter((item) => item.name.toLowerCase().includes(q))
        : apiGroups,
    [apiGroups, q],
  );

  const teachers = useMemo(
    () =>
      q
        ? apiTeachers.filter((item) => item.name.toLowerCase().includes(q))
        : apiTeachers,
    [apiTeachers, q],
  );

  const audiences = useMemo(
    () =>
      q
        ? apiAudiences.filter((item) => item.name.toLowerCase().includes(q))
        : apiAudiences,
    [apiAudiences, q],
  );

  const favorites = useMemo(() => {
    if (favoriteIds.length === 0) return [];
    const all = [...apiGroups, ...apiTeachers, ...apiAudiences];
    return all.filter((item) => favoriteIds.includes(item.id));
  }, [apiGroups, apiTeachers, apiAudiences, favoriteIds]);

  const hasData =
    apiGroups.length > 0 || apiTeachers.length > 0 || apiAudiences.length > 0;

  const sectionsData = useMemo(() => {
    const sections: SectionData[] = [];

    if (!q && favorites.length > 0) {
      sections.push({
        id: "favorites",
        title: "Избранное",
        subtitle: "Зажмите, чтобы добавить или удалить",
        iconName: "bookmark",
        items: favorites,
      });
    }

    if (groups.length > 0) {
      sections.push({
        id: "groups",
        title: "Группы",
        iconName: "users",
        items: groups,
      });
    }
    if (teachers.length > 0) {
      sections.push({
        id: "teachers",
        title: "Преподаватели",
        iconName: "user",
        items: teachers,
      });
    }
    if (audiences.length > 0) {
      sections.push({
        id: "audiences",
        title: "Аудитории",
        iconName: "sidebar",
        items: audiences,
      });
    }

    return sections;
  }, [q, favorites, groups, teachers, audiences]);

  const renderSectionItem = useCallback(
    ({ item }: { item: SectionData }) => (
      <SearchSection
        title={item.title}
        subtitle={item.subtitle}
        iconName={item.iconName}
        items={item.items}
        favoriteIds={favoriteIds}
        onItemPress={handleItemPress}
        onItemLongPress={handleToggleFavorite}
      />
    ),
    [favoriteIds, handleItemPress, handleToggleFavorite],
  );

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: Math.max(insets.top, 12),
          },
          animatedStyle,
        ]}
      >
        <GestureDetector gesture={headerPanGesture}>
          <View style={styles.headerTouchArea}>
            <View style={styles.dragHandleContainer}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: colors.cardBgBorder },
                ]}
              />
            </View>

            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
              onClose={handleClose}
            />
          </View>
        </GestureDetector>

        {(isLoading || !isFavoritesLoaded) && !hasData && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.textPrimary} />
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              Загрузка данных...
            </Text>
          </View>
        )}

        {isError && !hasData && (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>
              {error?.message || "Не удалось загрузить данные"}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.cardBg }]}
              onPress={refetch}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
                Повторить попытку
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {(hasData || (!isLoading && !isError)) && isFavoritesLoaded && (
          <FlatList
            data={sectionsData}
            keyExtractor={(item) => item.id}
            renderItem={renderSectionItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            initialNumToRender={2}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  headerTouchArea: {
    width: "100%",
    backgroundColor: "transparent",
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 4,
    width: "100%",
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
