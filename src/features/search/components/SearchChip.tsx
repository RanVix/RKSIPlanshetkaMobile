import { useTheme } from "@/context/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SearchItem } from "../types/search";

interface SearchChipProps {
  item: SearchItem;
  isFavorite: boolean;
  onPress: (item: SearchItem) => void;
  onLongPress: (item: SearchItem) => void;
}

export const SearchChip: React.FC<SearchChipProps> = ({
  item,
  isFavorite,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: colors.cardBg,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={300}
    >
      <Text
        style={[styles.label, { color: colors.textPrimary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {item.name}
      </Text>

      {isFavorite && (
        <View style={styles.favoriteBadge}>
          <FontAwesome name="bookmark" size={10} color={colors.favorite} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    width: "48.5%",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  favoriteBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
