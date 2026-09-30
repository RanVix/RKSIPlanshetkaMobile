import { useTheme } from "@/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { SearchItem } from "../types/search";
import { SearchChip } from "./SearchChip";

interface SearchSectionProps {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Feather.glyphMap;
  items: SearchItem[];
  favoriteIds: string[];
  onItemPress: (item: SearchItem) => void;
  onItemLongPress: (item: SearchItem) => void;
}

const COLUMNS = 2;
const GRID_GAP = 10;

export const SearchSection: React.FC<SearchSectionProps> = ({
  title,
  subtitle,
  iconName,
  items,
  favoriteIds,
  onItemPress,
  onItemLongPress,
}) => {
  const { colors } = useTheme();

  const [gridWidth, setGridWidth] = useState(0);

  const handleGridLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  const chipWidth =
    gridWidth > 0
      ? (gridWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS
      : undefined;

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather
            name={iconName}
            size={18}
            color={colors.textPrimary}
            style={styles.headerIcon}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View
        style={[styles.separator, { backgroundColor: colors.cardBgBorder }]}
      />

      <View style={styles.grid} onLayout={handleGridLayout}>
        {items.map((item) => (
          <SearchChip
            key={item.id}
            item={item}
            width={chipWidth}
            isFavorite={favoriteIds.includes(item.id)}
            onPress={onItemPress}
            onLongPress={onItemLongPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  separator: {
    height: 1,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
});
