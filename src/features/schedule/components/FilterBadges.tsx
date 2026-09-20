import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";

export interface FilterItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

interface FilterBadgesProps {
  filters: FilterItem[];
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({ filters }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      {filters.map((filter) => (
        <View
          key={filter.id}
          style={[
            styles.badge,
            {
              backgroundColor: colors.badgeBg,
              borderColor: isDark ? colors.badgeBorder : "transparent",
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          <Feather name={filter.icon} size={13} color={colors.textFilter} />
          <Text style={[styles.text, { color: colors.textFilter }]}>
            {filter.text}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-start",

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    elevation: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
