import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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

import { COLORS } from "@/constants/theme";
import { SearchInput } from "../features/search/components/SearchInput";
import { SearchSection } from "../features/search/components/SearchSection";
import { MOCK_SEARCH_DATA, SearchItem } from "../features/search/types/search";

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["g1", "t1", "c1"]);

  const translateY = useSharedValue(0);

  const handleClose = () => {
    router.back();
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleToggleFavorite = (item: SearchItem) => {
    const isFav = favoriteIds.includes(item.id);
    if (isFav) {
      setFavoriteIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      setFavoriteIds((prev) => [...prev, item.id]);
    }
  };

  const handleItemPress = (item: SearchItem) => {
    // console.log("Selected:", item.name);
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_SEARCH_DATA;
    return MOCK_SEARCH_DATA.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const favorites = useMemo(
    () => MOCK_SEARCH_DATA.filter((item) => favoriteIds.includes(item.id)),
    [favoriteIds],
  );
  const groups = useMemo(
    () => filteredData.filter((item) => item.category === "groups"),
    [filteredData],
  );
  const teachers = useMemo(
    () => filteredData.filter((item) => item.category === "teachers"),
    [filteredData],
  );
  const cabinets = useMemo(
    () => filteredData.filter((item) => item.category === "cabinets"),
    [filteredData],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 12) },
          animatedStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
        </GestureDetector>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          onClose={handleClose}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!searchQuery && favorites.length > 0 && (
            <SearchSection
              title="Избранное"
              subtitle="Зажмите, чтобы добавить в избранное"
              iconName="bookmark"
              items={favorites}
              favoriteIds={favoriteIds}
              onItemPress={handleItemPress}
              onItemLongPress={handleToggleFavorite}
            />
          )}

          <SearchSection
            title="Группы"
            iconName="users"
            items={groups}
            favoriteIds={favoriteIds}
            onItemPress={handleItemPress}
            onItemLongPress={handleToggleFavorite}
          />

          <SearchSection
            title="Преподаватели"
            iconName="user"
            items={teachers}
            favoriteIds={favoriteIds}
            onItemPress={handleItemPress}
            onItemLongPress={handleToggleFavorite}
          />

          <SearchSection
            title="Кабинеты"
            iconName="sidebar"
            items={cabinets}
            favoriteIds={favoriteIds}
            onItemPress={handleItemPress}
            onItemLongPress={handleToggleFavorite}
          />
        </ScrollView>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    overflow: "hidden",
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
    backgroundColor: "#30363D",
    borderRadius: 2.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
