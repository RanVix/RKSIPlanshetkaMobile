import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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

export const SearchSection: React.FC<SearchSectionProps> = ({
  title,
  subtitle,
  iconName,
  items,
  favoriteIds,
  onItemPress,
  onItemLongPress,
}) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather
            name={iconName}
            size={18}
            color="#FFFFFF"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.separator} />

      <View style={styles.grid}>
        {items.map((item) => (
          <SearchChip
            key={item.id}
            item={item}
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
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    color: "#6E7681",
    fontSize: 12,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#21262D",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
